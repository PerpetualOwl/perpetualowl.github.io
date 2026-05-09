# =====================================================================
# STAT 114 Demo: Hidden Markov Model for CpG Island Detection
# =====================================================================
# Uses the Durbin et al. (1998) dinucleotide transition HMM.
# Instead of emitting individual bases, the model observes dinucleotide
# transitions (e.g., "CG", "AA") which directly capture CpG enrichment.
#
# References:
#   - Durbin, Eddy, Krogh, Mitchison (1998) Ch. 3
#   - Gardiner-Garden & Frommer (1987) for 200bp minimum length
#   - Wu, Caffo, Jaffee, Irizarry, Feinberg (2010) PMC2883304
# =====================================================================

# 1. Install required packages if missing (Run this before the presentation)
# if (!require("BiocManager", quietly = TRUE)) install.packages("BiocManager")
# BiocManager::install(c("BSgenome.Hsapiens.UCSC.hg38", "rtracklayer", "GenomicRanges"))
# install.packages("HMM")

library(BSgenome.Hsapiens.UCSC.hg38)
library(rtracklayer)
library(GenomicRanges)
library(HMM)

# ---------------------------------------------------------------------
# Step 1: Fetch Real Genomic Data (Human hg38, a slice of Chr 22)
# ---------------------------------------------------------------------
cat("Loading genome sequence...\n")
chr22_seq <- Hsapiens$chr22

# Extract a 700kb window (short enough for a live Viterbi run)
start_pos <- 35500000
end_pos   <- 36200000
seq_window <- subseq(chr22_seq, start = start_pos, end = end_pos)

# Convert sequence to a character vector of individual bases
dna_chars <- unlist(strsplit(as.character(seq_window), ""))
dna_chars[!dna_chars %in% c("A", "C", "G", "T")] <- "A"  # Clean unknown bases

# Convert to dinucleotide observations: pairs of consecutive bases
# Each observation is a 2-character string like "CG", "AA", etc.
# This is the key insight from Durbin et al. — dinucleotide transitions
# directly capture CpG enrichment/depletion.
n_bases <- length(dna_chars)
dinucs  <- paste0(dna_chars[1:(n_bases - 1)], dna_chars[2:n_bases])

cat(sprintf("Sequence: %d bases → %d dinucleotide observations\n",
            n_bases, length(dinucs)))

# ---------------------------------------------------------------------
# Step 2: Define HMM Parameters (Durbin et al. 1998, Table 3.5)
# ---------------------------------------------------------------------
# Two hidden states: CpG island (CpG+) vs. background (CpG-)
states  <- c("CpG+", "CpG-")

# 16 possible dinucleotide symbols
bases   <- c("A", "C", "G", "T")
symbols <- as.vector(outer(bases, bases, paste0))  # AA, AC, AG, ..., TT

# --- Initial Probabilities (pi) ---
# CpG islands cover ~1-2% of the genome
startProbs <- c(0.02, 0.98)

# --- State Transition Matrix ---
# Controls expected length of CpG+ and CpG- regions via geometric distribution:
#   Expected CpG+ length: 1/(1 - 0.998) = 500 bp (typical island ~500-1000 bp)
#   Expected CpG- length: 1/(1 - 0.9999) = 10000 bp (background between islands)
# Tuned from Durbin et al. (1998) base values to match UCSC island density.
transProbs <- matrix(c(0.998,  0.002,
                        0.0001, 0.9999), nrow = 2, byrow = TRUE)
dimnames(transProbs) <- list(states, states)

# --- Emission Probabilities (Dinucleotide Transition Frequencies) ---
# From Durbin et al. (1998) Table 3.5, trained on labeled human sequences.
#
# CpG+ (island): rows = previous base, cols = next base
# Note the high C→G probability (0.274) — CpG dinucleotides are preserved.
cpg_plus <- matrix(c(
  0.180, 0.274, 0.426, 0.120,   # A →
  0.171, 0.368, 0.274, 0.188,   # C →
  0.161, 0.339, 0.375, 0.125,   # G →
  0.079, 0.355, 0.384, 0.182    # T →
), nrow = 4, byrow = TRUE)

# CpG- (background): CpG is depleted due to methylation-driven mutation.
# Note the low C→G probability (0.078) — CpG dinucleotides are rare.
cpg_minus <- matrix(c(
  0.300, 0.205, 0.285, 0.210,   # A →
  0.322, 0.298, 0.078, 0.302,   # C →
  0.248, 0.246, 0.298, 0.208,   # G →
  0.177, 0.239, 0.292, 0.292    # T →
), nrow = 4, byrow = TRUE)

rownames(cpg_plus) <- rownames(cpg_minus) <- bases
colnames(cpg_plus) <- colnames(cpg_minus) <- bases

# Build the 2×16 emission matrix expected by the HMM package.
# Each row is a state, each column is a dinucleotide symbol.
# P(emit "XY" | state) = P(Y | X, state) — the dinucleotide frequency.
emissionProbs <- matrix(0, nrow = 2, ncol = 16)
dimnames(emissionProbs) <- list(states, symbols)

for (i in seq_along(bases)) {
  for (j in seq_along(bases)) {
    sym <- paste0(bases[i], bases[j])
    # Normalize: P(XY) ∝ P(Y|X) × P(X). Use uniform base probs (0.25) for P(X).
    # This is a simplification — the key discriminative signal is in the
    # dinucleotide ratios, not the marginal base frequencies.
    emissionProbs["CpG+", sym] <- cpg_plus[i, j] / 4
    emissionProbs["CpG-", sym] <- cpg_minus[i, j] / 4
  }
}

# Renormalize rows to sum to 1 (required by HMM package)
emissionProbs["CpG+", ] <- emissionProbs["CpG+", ] / sum(emissionProbs["CpG+", ])
emissionProbs["CpG-", ] <- emissionProbs["CpG-", ] / sum(emissionProbs["CpG-", ])

# Initialize the HMM
hmm_model <- initHMM(States  = states,
                      Symbols = symbols,
                      startProbs    = startProbs,
                      transProbs    = transProbs,
                      emissionProbs = emissionProbs)

# ---------------------------------------------------------------------
# Step 3: Decode the Hidden States (Viterbi Algorithm)
# ---------------------------------------------------------------------
cat("Running Viterbi algorithm...\n")
viterbi_path <- viterbi(hmm_model, dinucs)

# Map dinucleotide states back to base positions:
# Dinucleotide i corresponds to bases i and i+1.
# We assign each base the state of the dinucleotide that starts there,
# with the last base inheriting the state of the final dinucleotide.
base_states <- c(viterbi_path, viterbi_path[length(viterbi_path)])

# --- Post-processing: Minimum Island Length Filter ---
# Gardiner-Garden & Frommer (1987) define CpG islands as ≥200 bp.
# Short predictions are likely noise — filter them out.
min_island_bp <- 200

pred_numeric <- ifelse(base_states == "CpG+", 1, 0)
rle_pred     <- rle(pred_numeric)

# Zero out CpG+ runs shorter than the minimum length
run_end <- cumsum(rle_pred$lengths)
run_start <- c(1, run_end[-length(run_end)] + 1)

for (k in seq_along(rle_pred$lengths)) {
  if (rle_pred$values[k] == 1 && rle_pred$lengths[k] < min_island_bp) {
    pred_numeric[run_start[k]:run_end[k]] <- 0
  }
}

# Report predicted islands
rle_filtered  <- rle(pred_numeric)
filt_end      <- cumsum(rle_filtered$lengths)
filt_start    <- c(1, filt_end[-length(filt_end)] + 1)
island_idx    <- which(rle_filtered$values == 1)
n_predicted   <- length(island_idx)

cat(sprintf("Predicted %d CpG island(s) (after %d bp minimum length filter)\n",
            n_predicted, min_island_bp))

if (n_predicted > 0) {
  for (idx in island_idx) {
    cat(sprintf("  Island: %s:%d-%d (%d bp)\n",
                "chr22",
                start_pos + filt_start[idx] - 1,
                start_pos + filt_end[idx] - 1,
                rle_filtered$lengths[idx]))
  }
}

# ---------------------------------------------------------------------
# Step 4: Fetch Ground Truth Annotations via rtracklayer
# ---------------------------------------------------------------------
cat("Fetching UCSC CpG island annotations (ground truth)...\n")

# Open a session to UCSC and set the genome to hg38
session <- browserSession("UCSC")
genome(session) <- "hg38"

# Define our specific window as a GRanges object
my_window <- GRanges("chr22", IRanges(start_pos, end_pos))

# Query the CpG Island track for our window
cpg_query      <- ucscTableQuery(session, table = "cpgIslandExt", range = my_window)
true_in_window <- track(cpg_query)

cat(sprintf("UCSC annotated CpG islands in window: %d\n", length(true_in_window)))

# ---------------------------------------------------------------------
# Step 5: Compute Overlap Statistics
# ---------------------------------------------------------------------
if (length(true_in_window) > 0) {
  true_starts <- start(true_in_window) - start_pos + 1
  true_ends   <- end(true_in_window) - start_pos + 1

  # Build a binary ground-truth vector
  truth_numeric <- rep(0, n_bases)
  for (k in seq_along(true_starts)) {
    s <- max(1, true_starts[k])
    e <- min(n_bases, true_ends[k])
    if (s <= e) truth_numeric[s:e] <- 1
  }

  # Overlap metrics
  tp <- sum(pred_numeric == 1 & truth_numeric == 1)
  fp <- sum(pred_numeric == 1 & truth_numeric == 0)
  fn <- sum(pred_numeric == 0 & truth_numeric == 1)

  sensitivity <- if ((tp + fn) > 0) round(tp / (tp + fn) * 100, 1) else NA
  precision   <- if ((tp + fp) > 0) round(tp / (tp + fp) * 100, 1) else NA

  cat(sprintf("Base-level sensitivity: %.1f%%\n", sensitivity))
  cat(sprintf("Base-level precision:   %.1f%%\n", precision))
}

# ---------------------------------------------------------------------
# Step 6: Visualization
# ---------------------------------------------------------------------
par(mfrow = c(2, 1), mar = c(4, 5, 3, 1))

# Plot 1: HMM Viterbi Prediction
plot(pred_numeric, type = "S", col = "#2166AC", lwd = 2,
     yaxt = "n", xlab = "Position in Window (bp)", ylab = "State",
     main = sprintf("Viterbi Predicted CpG Islands (%d detected)", n_predicted))
axis(2, at = c(0, 1), labels = c("Background", "CpG Island"), las = 2)

# Plot 2: UCSC Ground Truth
plot(0, type = "n", xlim = c(1, n_bases), ylim = c(0, 1),
     yaxt = "n", xlab = "Position in Window (bp)", ylab = "State",
     main = sprintf("UCSC Annotated CpG Islands (%d in window)", length(true_in_window)))
axis(2, at = c(0, 1), labels = c("Background", "CpG Island"), las = 2)

# Draw rectangles for true annotated islands
if (length(true_in_window) > 0) {
  starts <- start(true_in_window) - start_pos + 1
  ends   <- end(true_in_window) - start_pos + 1
  rect(xleft = starts, ybottom = 0, xright = ends, ytop = 1,
       col = "#1B7837", border = NA)
}