const express = require('express');

const app = express()
app.use(express.json());

var roles = ['Morgana', 'Merlin', 'Citizen', 'Percival', 'Mordred'];
var orderNumbers = [1, 2, 3, 4, 5]

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

const characters = []
app.get('/', (req, res) => {
    res.send('Hello World Hihh s');
});


app.post('/readyupinitial', (req, res) => {
    const randVal = getRandomInt(0, roles.length);
    const orderNumRandVal = getRandomInt(0, orderNumbers.length)
    const orderNum = orderNumbers[orderNumRandVal]
    const role = roles[randVal];
    const idNum = getRandomInt(0, 10000)
    const character= {id: idNum, name: req.body.name, role: role, order: orderNum, readyStatus: 0};
    roles.splice(randVal, 1);
    orderNumbers.splice(orderNumRandVal, 1);
    characters.push(character);
    var checkIfAllReadiedUp = new Promise(function(resolve, reject){
        while(characters.length != 5){}
        resolve("Here's your data");
      });
    
    res.send(characters);
});


app.get('/characters', (req, res) => {
    console.log(characters);
    res.send(characters);
});

app.get('/characters/:name', (req, res) => {
    const character= characters.find(c => c.name === req.params.name);
    res.send(character);
});

//change the ready status
app.post('/readyup', (req, res) => {
    const randVal = getRandomInt(0, roles.length);
    const orderNumRandVal = getRandomInt(0, orderNumbers.length)
    const orderNum = orderNumbers[orderNumRandVal]
    const role = roles[randVal];
    const idNum = getRandomInt(0, 10000)
    const character= {id: idNum, name: req.body.name, role: role, order: orderNum, readyStatus: 1};
    roles.splice(randVal, 1);
    orderNumbers.splice(orderNumRandVal, 1);
    characters.push(character);
    res.send(characters);
});

app.listen(3000, () => console.log('Listening on 3000'))