import requests
import json

data={'name': 'Dev', 'role': 'Percival'}
r = requests.post("http://localhost:3000/characters", json = {'name': 'Dev', 'role': 'Percival'})
r = requests.get("http://localhost:3000/characters")
lst = r.json()
while(len(lst) < 5):
    r = requests.get("http://localhost:3000/characters")
    lst = r.json()
print('We found 5 players Client 1')
print(data)


