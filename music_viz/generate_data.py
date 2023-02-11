import random

f = open("artists.csv", "w")
artists = ["Adele", "Drake", "Lady Gaga", "Taylor Swift", "Beyoncé", "Other"]
genres = ["Pop", "R&B", "Hip-Hop", "Country", "Rap", "Other"]
f.write("Artist,Genre,matches,hours\n")

for i in range(100):
    artist = random.choice(artists)
    genre = random.choice(genres)
    index = random.randint(0, 10)
    matches = str(index)
    hours = str(4 * index + random.randint(-5, 5))
    f.write(f"{artist},{genre},{matches},{hours}\n")