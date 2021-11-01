//const { SSL_OP_NO_TICKET } = require('constants');
const { strictEqual } = require('assert')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const schema = require('./models/avalonModel')
mongoose.connect('mongodb://localhost:27017/avalonApp')

var characters = ["Morgana", "Merlin", "Percival", "Mordred", "Citizen"]
var socketId = []
var charAssignments = []
var orderedSocketID = []
var readyUpId = []
var readyUpCount = 0
var rejectOrAcceptCount = 0
var rejectOrAccept = 0
var peopleOnTheMission = []
var passFailCount = 0
var passOrFail = []
var roundsStatus = []
var roomNumbers = []
var socketIDtoRoom = {};
//var roomToSocketID = {};
schema.create({name:'rithesh'}, function (err, results) {
    if(err) {
        throw error;
    }
    console.log(results)
});
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
  

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

app.get('/home', (req, res) => {
    res.send('hi');
});

server.listen(5000, () => {
    console.log("Server running...");
});

io.on('connection', (socket) => { 
    console.log("User connected: " + socket.id);
    console.log(io.engine.clientsCount)
    randNum = getRndInteger(0, characters.length)
    character = characters[randNum]
    characters.splice(randNum, 1)

    characterDict = {"id": socket.id, "character": character}
    charAssignments.push(characterDict)
    socketId.push(socket.id)

    //CHANGE THIS NUMBER TO 5 OR WHATEVER
    if (io.engine.clientsCount == 2) {
        for (var i = 0; i < charAssignments.length; i++) {
                //io.to(charAssignments[i].id).emit('charAssigned', charAssignments[i].character)
            }
        orderedSocketID = shuffle(socketId)
    }

    socket.on('createRoom', (roomNumber) => {
        socketIDtoRoom[socket.id] = roomNumber
        //roomToSocketID[roomNumber] = [socket.id]
        roomNumbers.push(roomNumber)
        //console.log(roomToSocketID)
        //io.to(socket.id).emit('roomCreated')

    })

    socket.on('joinRoom', (roomNumber) => {
        socketIDtoRoom[socket.id] = roomNumber
        //lst = roomToSocketID[roomNumber]
        //lst.push(socket.id)
        //console.log(lst)
        //roomToSocketID[roomNumber] = lst
        //console.log(roomToSocketID)
    })

    socket.on("rejectOrAccept", (data) => {
        rejectOrAccept += data
        rejectOrAcceptCount += 1
        if (rejectOrAcceptCount == socketId.length) {
            if(rejectOrAccept/socketId.length > 0.5) {
                //mission Accepted
                io.emit("missionAccepted", {data: peopleOnTheMission, leader: orderedSocketID[0]})
            } else {
                //mission Rejected
                peopleOnTheMission = []
                currentLeader = orderedSocketID.shift()
                orderedSocketID.push(currentLeader)
                io.emit('readyUp', {order: orderedSocketID})
            }
            rejectOrAccept = 0
            rejectOrAcceptCount = 0
        }
    })

    socket.on('letMissionProceed', () =>{
        console.log(peopleOnTheMission.length)
        for (var i = 0; i < peopleOnTheMission.length; i++) {
            console.log('hi');
            io.to(peopleOnTheMission[i]).emit('passOrFail');
        }

    })

    socket.on('passOrFail', (passFail) =>{
        passOrFail.push(passFail)
        passFailCount = passFailCount + 1
        //change this to whatever number is designated with a certain round
        var missionFailed = false
        if (passFailCount == 1) {
            console.log("PASS OR FAIL ")
            console.log(passOrFail)
            for (var i = 0; i < passOrFail.length; i++) {
                if(passOrFail[i] == 0) {
                    missionFailed = true
                }
            }
            var missionStatus = ""
            if (missionFailed) {
                roundsStatus.push(0)
                peopleOnTheMission = []
                currentLeader = orderedSocketID.shift()
                orderedSocketID.push(currentLeader)
                missionStatus = "The mission Failed!"
            } else {
                roundsStatus.push(1)
                peopleOnTheMission = []
                currentLeader = orderedSocketID.shift()
                orderedSocketID.push(currentLeader)
                missionStatus = "The mission Passed!"
            }
            passOrFail = []
            passFailCount = 0
            console.log(roundsStatus)
            io.emit('missionOver', {data: passOrFail, missionStatus: missionStatus})
        }
    })

    socket.on("chosen", (data) => {
        io.emit('chosen', data)
        peopleOnTheMission.push(data)
    })

    socket.on("readyUp", () => {
        if (!readyUpId.includes(socket.id)) {
            readyUpId.push(socket.id)
            readyUpCount = readyUpCount + 1;
            console.log(readyUpId)
        }
      
        if (readyUpCount == 2) {
            console.log('2 people have readied up!')
            readyUpId = []
            readyUpCount = 0
            io.emit("readyUp", {order: orderedSocketID})
        }
    })



    socket.on("message", (data) => {
        console.log(data)
        socket.broadcast.emit('message', { id: socket.id, message: data })
    })

});