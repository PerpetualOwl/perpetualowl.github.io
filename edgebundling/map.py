
minLat = 42.368868
maxLat = 42.38248309999999
minLon = -71.124731
maxLon = -71.115963

midLat = (maxLat + minLat) / 2
midLon = (maxLon + minLon) / 2


token = "pk.eyJ1IjoicGVycGV0dWFsb3dsIiwiYSI6ImNsZGptZHI2cjFzaDgzb3I4a3pldmFzN28ifQ.Co912rJ9zIHITERU59D-HA"
style = "perpetualowl/cldjmnyiv005g01o6isgb6der"
#style = "mapbox/streets-v11" #for testing only
width = 960
height = 600
zoom = 13.87 # 13
print(f"projection is {zoom * 1200000 / 13.87}")


query = f"https://api.mapbox.com/styles/v1/{style}/static/{midLon},{midLat},{zoom}/{width}x{height}@2x?logo=false&attribution=false&access_token={token}"

print(query)
import requests # request img from web
import shutil # save img locally

url = query
file_name = "./img.jpeg"

res = requests.get(url, stream = True)

if res.status_code == 200:
    with open(file_name,'wb') as f:
        shutil.copyfileobj(res.raw, f)
    print('Image sucessfully Downloaded: ',file_name)
else:
    print('Image Couldn\'t be retrieved')