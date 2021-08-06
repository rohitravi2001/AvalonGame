const express = require('express');

const app = express()
app.use(express.json());

const characters = [
    {name: 'afzal', role: 'Morgana'},
    {name: 'ritesh', role: 'Merlin'},
    {name: 'rohit', role: 'Citizen'}
]
app.get('/', (req, res) => {
    res.send('Hello World Hihh s');
});

app.get('/characters', (req, res) => {
    console.log(characters);
    res.send(characters);
});


app.get('/characters', (req, res) => {
    console.log(characters);
    res.send(characters);
});

app.post('/characters', (req, res) => {
    console.log(req.body)
    const character= {name: req.body.name, role: req.body.role};
    characters.push(character);
    res.send(character);
});

app.get('/characters/:name', (req, res) => {
    const character= characters.find(c => c.name === req.params.name);
    res.send(character);
});

app.listen(3000, () => console.log('Listening on 3000'))