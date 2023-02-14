import random
import requests

school = "Harvard College"
yard_dorms = ["Apley Court", "Canaday Hall", "Grays Hall", "Greenough Hall", "Hollis Hall", "Holworthy Hall", "Hurlbut Hall", "Lionel Hall", "Massachusetts Hall", "Matthews Hall", "Mower Hall", "Pennypacker Hall", "Stoughton Hall", "Straus Hall", "Thayer Hall", "Weld Hall", "Wigglesworth Hall", "Maple Yard Dorms"]
houses = ["Adams House", "Quincy House", "Dunster House", "Cabot House", "Eliot House", "Currier House", "Pforzheimer House", "Winthrop House", "Mather House", "Lowell House", "Leverett House", "Kirkland House"]
dorms = yard_dorms + houses
google_api_key = "AIzaSyASlhiI1PI6HN3cwhtswOx3TUpbr9crmJU" #PLEASE DON'T OVERUSE THIS KEY
print("Warning: CAREFUL DO NOT OVERUSE API KEY OR FREE TRIAL WILL RUN OUT")

f = open("./connections.csv", "w")
f.write("origin,destination,count\n")

for i in range(len(dorms)):
    for j in range(len(dorms)):
        if i != j:
            amt = 10
            if dorms[i] in houses:
                amt = amt * 2

            if dorms[j] in houses:
                amt = amt * 2

            f.write(f"{dorms[i]},{dorms[j]},{random.randint(amt - 9, amt + 25)}\n")

f.close()


f = open("./list_of_dorms.csv", "w")
f.write("iata,latitude,longitude\n")
for i in range(len(dorms)):
    query = f"{dorms[i]} {school}".replace(" ", "+")
    response = requests.get(f'https://maps.googleapis.com/maps/api/geocode/json?address={query}&key={google_api_key}')

    resp_json_payload = response.json()

    f.write(f"{dorms[i]},{resp_json_payload['results'][0]['geometry']['location']['lat']},{resp_json_payload['results'][0]['geometry']['location']['lng']}\n")
    
f.close()


