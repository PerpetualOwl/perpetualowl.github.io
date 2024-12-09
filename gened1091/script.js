// Game State
const gameState = {
    province: "",
    population: 1000,
    agriculture: 500,
    military: 300,
    defensibility: 50,
    advisors: [],
    turn: 1
};

// Helper Function to Generate Random Numbers within a Range
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Advisors Definitions with Friendliness and Multiple Effects
const advisors = [
    {
        name: "Lord Shang",
        school: "Legalism",
        friendliness: 0,
        advice: "Implement a merit-based bureaucracy to strengthen your administration.",
        effects: [
            {
                description: "has implemented a merit-based bureaucracy.",
                type: "positive",
                baseEffects: {
                    agriculture: { min: 60, max: 120 },
                    military: { min: 80, max: 150 }
                }
            },
            {
                description: "has cracked down on corruption within your administration.",
                type: "positive",
                baseEffects: {
                    defensibility: { min: 20, max: 40 }
                }
            },
            {
                description: "has enforced strict laws, causing public discontent.",
                type: "negative",
                baseEffects: {
                    population: { min: -50, max: -100 },
                    defensibility: { min: -10, max: -20 }
                }
            },
            {
                description: "has optimized tax collection, increasing revenue but straining farmers.",
                type: "neutral",
                baseEffects: {
                    agriculture: { min: -30, max: -60 },
                    economy: { min: 50, max: 100 } // Assuming economy affects agriculture indirectly
                }
            }
        ],
        effect: function () {
            this.friendliness += 1;
            const selectedEffect = this.effects[Math.floor(Math.random() * this.effects.length)];
            let message = `Lord Shang ${selectedEffect.description} `;

            // Calculate modifiers based on friendliness
            const friendlinessModifier = 1 + (this.friendliness * 0.05); // 5% increase per friendliness level

            // Apply effects
            for (let [key, value] of Object.entries(selectedEffect.baseEffects)) {
                if (key === "economy") {
                    // Assuming economy affects agriculture indirectly
                    const economyChange = randomRange(value.min, value.max) * friendlinessModifier;
                    // For simplicity, let's say economy directly increases agriculture
                    gameState.agriculture += Math.round(economyChange);
                    message += `Agriculture has increased by +${Math.round(economyChange)}. `;
                } else {
                    const change = randomRange(value.min, value.max) * friendlinessModifier;
                    gameState[key] += Math.round(change);
                    if (change >= 0) {
                        message += `${capitalizeFirstLetter(key)} has increased by +${Math.round(change)}. `;
                    } else {
                        message += `${capitalizeFirstLetter(key)} has decreased by ${Math.round(change)}. `;
                    }
                }
            }

            displayEvent(message);
        }
    },
    {
        name: "Confucian Disciple",
        school: "Confucianism",
        friendliness: 0,
        advice: "Foster moral virtues and societal harmony to ensure stability.",
        effects: [
            {
                description: "promotes societal harmony, enhancing public morale.",
                type: "positive",
                baseEffects: {
                    population: { min: 80, max: 150 },
                    defensibility: { min: 10, max: 30 }
                }
            },
            {
                description: "establishes educational institutions, increasing loyalty.",
                type: "positive",
                baseEffects: {
                    population: { min: 50, max: 100 },
                    agriculture: { min: 20, max: 40 }
                }
            },
            {
                description: "focuses too much on ceremonies, neglecting essential policies.",
                type: "negative",
                baseEffects: {
                    agriculture: { min: -40, max: -80 },
                    military: { min: -30, max: -60 }
                }
            },
            {
                description: "introduces strict moral codes, causing resistance among lower classes.",
                type: "negative",
                baseEffects: {
                    population: { min: -30, max: -60 }
                }
            }
        ],
        effect: function () {
            this.friendliness += 1;
            const selectedEffect = this.effects[Math.floor(Math.random() * this.effects.length)];
            let message = `The Confucian Disciple ${selectedEffect.description} `;

            // Calculate modifiers based on friendliness
            const friendlinessModifier = 1 + (this.friendliness * 0.05); // 5% increase per friendliness level

            // Apply effects
            for (let [key, value] of Object.entries(selectedEffect.baseEffects)) {
                const change = randomRange(value.min, value.max) * friendlinessModifier;
                gameState[key] += Math.round(change);
                if (change >= 0) {
                    message += `${capitalizeFirstLetter(key)} has increased by +${Math.round(change)}. `;
                } else {
                    message += `${capitalizeFirstLetter(key)} has decreased by ${Math.round(change)}. `;
                }
            }

            displayEvent(message);
        }
    },
    {
        name: "Han Feizi Advisor",
        school: "Legalism",
        friendliness: 0,
        advice: "Strengthen internal control and suppress dissent to maintain order.",
        effects: [
            {
                description: "advises strengthening internal control, enhancing security.",
                type: "positive",
                baseEffects: {
                    defensibility: { min: 20, max: 40 },
                    military: { min: 50, max: 100 }
                }
            },
            {
                description: "cracks down on dissent, reducing potential rebellions.",
                type: "positive",
                baseEffects: {
                    population: { min: -20, max: -40 }, // Reduced population due to crackdowns
                    defensibility: { min: 10, max: 20 }
                }
            },
            {
                description: "implements harsh punishments, causing public fear.",
                type: "negative",
                baseEffects: {
                    population: { min: -50, max: -100 },
                    economy: { min: -30, max: -60 }
                }
            },
            {
                description: "focuses too much on control, neglecting economic growth.",
                type: "negative",
                baseEffects: {
                    economy: { min: -50, max: -100 },
                    agriculture: { min: -20, max: -40 }
                }
            }
        ],
        effect: function () {
            this.friendliness += 1;
            const selectedEffect = this.effects[Math.floor(Math.random() * this.effects.length)];
            let message = `Han Feizi Advisor ${selectedEffect.description} `;

            // Calculate modifiers based on friendliness
            const friendlinessModifier = 1 + (this.friendliness * 0.05); // 5% increase per friendliness level

            // Apply effects
            for (let [key, value] of Object.entries(selectedEffect.baseEffects)) {
                if (key === "economy") {
                    // Assuming economy affects agriculture indirectly
                    const economyChange = randomRange(value.min, value.max) * friendlinessModifier;
                    gameState.agriculture += Math.round(economyChange);
                    message += `Agriculture has changed by ${Math.round(economyChange)}. `;
                } else {
                    const change = randomRange(value.min, value.max) * friendlinessModifier;
                    gameState[key] += Math.round(change);
                    if (change >= 0) {
                        message += `${capitalizeFirstLetter(key)} has increased by +${Math.round(change)}. `;
                    } else {
                        message += `${capitalizeFirstLetter(key)} has decreased by ${Math.round(change)}. `;
                    }
                }
            }

            displayEvent(message);
        }
    },
    {
        name: "Daoist Sage",
        school: "Daoism",
        friendliness: 0,
        advice: "Minimize interventions and allow natural development for prosperity.",
        effects: [
            {
                description: "encourages natural development, enhancing agriculture.",
                type: "positive",
                baseEffects: {
                    agriculture: { min: 30, max: 50 },
                    population: { min: 40, max: 100 }
                }
            },
            {
                description: "promotes harmony with nature, increasing public contentment.",
                type: "positive",
                baseEffects: {
                    population: { min: 60, max: 120 },
                    defensibility: { min: 10, max: 20 }
                }
            },
            {
                description: "neglects necessary interventions, leading to economic stagnation.",
                type: "negative",
                baseEffects: {
                    economy: { min: -40, max: -80 },
                    agriculture: { min: -20, max: -40 }
                }
            },
            {
                description: "focuses too much on relaxation, leading to reduced military vigilance.",
                type: "negative",
                baseEffects: {
                    military: { min: -50, max: -100 },
                    defensibility: { min: -10, max: -20 }
                }
            }
        ],
        effect: function () {
            this.friendliness += 1;
            const selectedEffect = this.effects[Math.floor(Math.random() * this.effects.length)];
            let message = `The Daoist Sage ${selectedEffect.description} `;

            // Calculate modifiers based on friendliness
            const friendlinessModifier = 1 + (this.friendliness * 0.05); // 5% increase per friendliness level

            // Apply effects
            for (let [key, value] of Object.entries(selectedEffect.baseEffects)) {
                if (key === "economy") {
                    // Assuming economy affects agriculture indirectly
                    const economyChange = randomRange(value.min, value.max) * friendlinessModifier;
                    gameState.agriculture += Math.round(economyChange);
                    message += `Agriculture has changed by ${Math.round(economyChange)}. `;
                } else {
                    const change = randomRange(value.min, value.max) * friendlinessModifier;
                    gameState[key] += Math.round(change);
                    if (change >= 0) {
                        message += `${capitalizeFirstLetter(key)} has increased by +${Math.round(change)}. `;
                    } else {
                        message += `${capitalizeFirstLetter(key)} has decreased by ${Math.round(change)}. `;
                    }
                }
            }

            displayEvent(message);
        }
    }
];

// Helper Function to Capitalize First Letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize Game
function initGame() {
    // Randomly select a province
    const provinces = ["Han", "Qi", "Chu", "Yan", "Zhao", "Wei", "齐"];
    gameState.province = provinces[Math.floor(Math.random() * provinces.length)];

    // Display initial status
    updateStatus();

    // Show first event
    displayEvent(`You are the warlord of the province of ${gameState.province}. Choose your first advisor to guide your rule.`);
    showAdvisorChoices();
}

// Update Status Display
function updateStatus() {
    document.getElementById("province-name").innerText = gameState.province;
    document.getElementById("population").innerText = gameState.population;
    document.getElementById("agriculture").innerText = gameState.agriculture;
    document.getElementById("military").innerText = gameState.military;
    document.getElementById("defensibility").innerText = gameState.defensibility;
}

// Display Event Messages
function displayEvent(message) {
    const eventsDiv = document.getElementById("events");
    eventsDiv.innerHTML += `<p>${message}</p>`;
}

// Show Advisor Choices
function showAdvisorChoices() {
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "<h3>Select an Advisor:</h3>";

    advisors.forEach((advisor, index) => {
        const button = document.createElement("button");
        button.innerText = `${advisor.name} (${advisor.school})`;
        button.onclick = () => {
            selectAdvisor(index);
        };
        choicesDiv.appendChild(button);
    });
}

// Handle Advisor Selection
function selectAdvisor(index) {
    const advisor = advisors[index];
    gameState.advisors.push(advisor.name); // Track advisor selections by name

    // Apply advisor's effect
    advisor.effect();

    // Update status
    updateStatus();

    // Clear choices and proceed to next turn
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = `<button onclick="nextTurn()">Proceed to Next Turn</button>`;
}

// Proceed to Next Turn
function nextTurn() {
    gameState.turn += 1;
    displayEvent(`--- Turn ${gameState.turn} ---`);

    // Random Event
    triggerRandomEvent();

    // Show possible actions
    showActions();
}

// Trigger Random Events
function triggerRandomEvent() {
    const events = [
        {
            description: "A neighboring province demands tribute.",
            action: "decideTribute",
            choices: [
                {
                    text: "Agree to pay tribute.",
                    effect: () => {
                        const agricultureDecrease = randomRange(30, 70);
                        gameState.agriculture -= agricultureDecrease;
                        displayEvent(
                            `You agreed to pay tribute, but your agricultural yields have decreased by -${agricultureDecrease}.`
                        );
                    }
                },
                {
                    text: "Refuse and prepare for war.",
                    effect: () => {
                        const militaryIncrease = randomRange(40, 100);
                        gameState.military += militaryIncrease;
                        displayEvent(
                            `You prepare your military for potential conflict. Military strength has increased by +${militaryIncrease}.`
                        );
                    }
                }
            ]
        },
        {
            description: "A drought affects your province.",
            action: "handleDrought",
            choices: [
                {
                    text: "Invest in irrigation systems.",
                    effect: () => {
                        const agricultureIncrease = randomRange(80, 120);
                        gameState.agriculture += agricultureIncrease;
                        displayEvent(
                            `You invested in irrigation. Agricultural yields have increased by +${agricultureIncrease}.`
                        );
                    }
                },
                {
                    text: "Do nothing.",
                    effect: () => {
                        const populationDecrease = randomRange(40, 60);
                        gameState.population -= populationDecrease;
                        displayEvent(
                            `The drought led to crop failures and a decrease in population by -${populationDecrease}.`
                        );
                    }
                }
            ]
        },
        {
            description: "A rebellious faction arises.",
            action: "suppressRebellion",
            choices: [
                {
                    text: "Use force to suppress the rebellion.",
                    effect: () => {
                        const militaryDecrease = randomRange(40, 60);
                        gameState.military -= militaryDecrease;
                        displayEvent(
                            `You used force to suppress the rebellion, weakening your military by -${militaryDecrease}.`
                        );
                    }
                },
                {
                    text: "Negotiate with the rebels.",
                    effect: () => {
                        const populationIncrease = randomRange(20, 40);
                        gameState.population += populationIncrease;
                        displayEvent(
                            `You negotiated successfully, leading to increased population loyalty by +${populationIncrease}.`
                        );
                    }
                }
            ]
        }
    ];

    // Randomly select an event
    const event = events[Math.floor(Math.random() * events.length)];
    displayEvent(event.description);
    presentEventChoices(event);
}

// Present Event Choices
function presentEventChoices(event) {
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "<h3>Choose an action:</h3>";

    event.choices.forEach(choice => {
        const button = document.createElement("button");
        button.innerText = choice.text;
        button.onclick = () => {
            choice.effect();
            updateStatus();
            // Check for game over conditions
            checkGameOver();
            // Proceed to next turn automatically after action
            nextTurn();
        };
        choicesDiv.appendChild(button);
    });
}

// Show General Actions
function showActions() {
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "<h3>Choose your action:</h3>";

    const actions = [
        {
            text: "Consult Advisors",
            action: () => {
                displayEvent("You decide to consult your advisors.");
                showAdvisorChoices();
            }
        },
        {
            text: "Manage Resources",
            action: () => {
                manageResources();
            }
        },
        {
            text: "Diplomacy",
            action: () => {
                diplomacy();
            }
        }
    ];

    actions.forEach(act => {
        const button = document.createElement("button");
        button.innerText = act.text;
        button.onclick = act.action;
        choicesDiv.appendChild(button);
    });
}

// Example: Manage Resources
function manageResources() {
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "<h3>Allocate Resources:</h3>";

    const allocations = [
        {
            text: "Increase agricultural investment",
            effect: () => {
                const agricultureIncrease = randomRange(80, 120);
                const populationDecrease = randomRange(15, 30);
                gameState.agriculture += agricultureIncrease;
                gameState.population -= populationDecrease;
                displayEvent(
                    `You invested more into agriculture, increasing yields by +${agricultureIncrease} ` +
                    `but reducing population by -${populationDecrease} due to relocation.`
                );
                updateStatus();
                checkGameOver();
                nextTurn();
            }
        },
        {
            text: "Strengthen the military",
            effect: () => {
                const militaryIncrease = randomRange(80, 120);
                const agricultureDecrease = randomRange(30, 70);
                gameState.military += militaryIncrease;
                gameState.agriculture -= agricultureDecrease;
                displayEvent(
                    `You strengthened your military, boosting it by +${militaryIncrease} ` +
                    `at the expense of agriculture, which decreased by -${agricultureDecrease}.`
                );
                updateStatus();
                checkGameOver();
                nextTurn();
            }
        },
        {
            text: "Promote trade and commerce",
            effect: () => {
                const agricultureIncrease = randomRange(30, 70);
                const populationIncrease = randomRange(40, 100);
                gameState.agriculture += agricultureIncrease;
                gameState.population += populationIncrease;
                displayEvent(
                    `You promoted trade, enhancing agricultural yields by +${agricultureIncrease} ` +
                    `and increasing population by +${populationIncrease}.`
                );
                updateStatus();
                checkGameOver();
                nextTurn();
            }
        }
    ];

    allocations.forEach(alloc => {
        const button = document.createElement("button");
        button.innerText = alloc.text;
        button.onclick = alloc.effect;
        choicesDiv.appendChild(button);
    });
}

// Example: Diplomacy
function diplomacy() {
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "<h3>Diplomatic Actions:</h3>";

    const diplomaticActions = [
        {
            text: "Form an alliance with a neighboring province",
            effect: () => {
                const militaryIncrease = randomRange(30, 80);
                gameState.military += militaryIncrease;
                displayEvent(
                    `You formed an alliance, strengthening your military presence by +${militaryIncrease}.`
                );
                updateStatus();
                checkGameOver();
                nextTurn();
            }
        },
        {
            text: "Spy on a neighboring province",
            effect: () => {
                displayEvent("You sent spies to gather intelligence. No immediate effect.");
                updateStatus();
                checkGameOver();
                nextTurn();
            }
        },
        {
            text: "Declare war on a weaker neighbor",
            effect: () => {
                const militaryDecrease = randomRange(80, 120);
                gameState.military -= militaryDecrease;
                displayEvent(
                    `You declared war, but your military overextended and weakened by -${militaryDecrease}.`
                );
                updateStatus();
                checkGameOver();
                nextTurn();
            }
        }
    ];

    diplomaticActions.forEach(action => {
        const button = document.createElement("button");
        button.innerText = action.text;
        button.onclick = action.effect;
        choicesDiv.appendChild(button);
    });
}

// Check for Game Over Conditions
function checkGameOver() {
    if (gameState.population <= 0) {
        displayEvent("Your population has dwindled to zero. Game Over.");
        endGame();
    } else if (gameState.defensibility >= 200) {
        displayEvent("Your province has become impregnable and isolated. Game Over.");
        endGame();
    } else if (gameState.military <= 0) {
        displayEvent("Your military has been decimated. Game Over.");
        endGame();
    }
}

// End Game
function endGame() {
    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = '<button onclick="location.reload()">Restart Game</button>';
}

// Start the Game on Page Load
window.onload = initGame;