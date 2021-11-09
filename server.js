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
var socketRoom
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

function getRoomNumber(socketId) {
    return socketIDtoRoom[socketId]
}

app.get('/home', (req, res) => {
    res.send('hi');
});

server.listen(5000, () => {
    console.log("Server running...");
});

io.on('connection', (socket) => { 
    

    // var characters = ["Morgana", "Merlin", "Percival", "Mordred", "Citizen"]
    // var socketId = []
    // var charAssignments = []
    // var orderedSocketID = []
    // var readyUpId = []
    // var readyUpCount = 0
    // var rejectOrAcceptCount = 0
    // var rejectOrAccept = 0
    // var peopleOnTheMission = []
    // var passFailCount = 0
    // var passOrFail = []
    // var roundsStatus = []
    // var roomNumbers = []
        
    console.log("User connected: " + socket.id);
    console.log(io.engine.clientsCount)

    async function fetchDatabase() {
        socketRoom = getRoomNumber(socket.id)
        try {
            let docs = await schema.find({roomID: socketRoom}) 
            data = docs[0].data
            socketId = data.socketId
            charAssignments = data.charAssignments
            orderedSocketID = data.orderedSocketID
            readyUpId = data.readyUpId
            readyUpCount = data.readyUpCount
            rejectOrAcceptCount = data.rejectOrAcceptCount
            rejectOrAccept = data.rejectOrAccept
            peopleOnTheMission = data.peopleOnTheMission
            passFailCount = data.passFailCount
            passOrFail = data.passOrFail
            roundsStatus = data.roundsStatus
            roomNumbers = data.roomNumbers
            characters = data.characters
            console.log("HIII")
            // console.log('REady up COunt')
            // console.log(readyUpCount)
        } catch(err) {
            console.log(err)
        }
            //console.log(data)
    }
    
    async function updateDatabase() {
        newData = {
            socketId: socketId,
            charAssignments: charAssignments,
            orderedSocketID: orderedSocketID,
            readyUpId: readyUpId,
            readyUpCount: readyUpCount,
            rejectOrAcceptCount: rejectOrAcceptCount,
            rejectOrAccept: rejectOrAccept, 
            peopleOnTheMission: peopleOnTheMission,
            passFailCount: passFailCount,
            passOrFail: passOrFail,
            roundsStatus: roundsStatus,
            roomNumbers: roomNumbers,
            characters: characters
        }
        try {
            await schema.updateMany({roomID: socketRoom}, {data: newData})
        } catch (err) {
            console.log(err)
        }
    }


    socket.on('createRoom', () => {
        var roomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000; 
        socketIDtoRoom[socket.id] = roomNumber
        schema.create({roomID: roomNumber, data: {}}, function (err, results) {
            if(err) {
                throw error;
            }
           //console.log(results)
        });
        //roomToSocketID[roomNumber] = [socket.id]
        roomNumbers.push(roomNumber)
        socket.join(roomNumber)
        //console.log(roomToSocketID)
        //io.to(socket.id).emit('roomCreated')

    })

    socket.on('joinRoom', (roomNumber) => {
        socketIDtoRoom[socket.id] = roomNumber
        socket.join(roomNumber)
    })

    socket.on("rejectOrAccept", async (data) => {
        await fetchDatabase()
        rejectOrAccept += data
        rejectOrAcceptCount += 1
        if (rejectOrAcceptCount == socketId.length) {
            if(rejectOrAccept/socketId.length > 0.5) {
                //mission Accepted
                io.in(socketRoom).emit("missionAccepted", {data: peopleOnTheMission, leader: orderedSocketID[0]})
            } else {
                //mission Rejected
                peopleOnTheMission = []
                currentLeader = orderedSocketID.shift()
                orderedSocketID.push(currentLeader)
                io.in(socketRoom).emit('readyUp', {order: orderedSocketID})
            }
            rejectOrAccept = 0
            rejectOrAcceptCount = 0
        }
        await updateDatabase()
    })

    socket.on('letMissionProceed', async () =>{
        await fetchDatabase()
        console.log(peopleOnTheMission.length)
        for (var i = 0; i < peopleOnTheMission.length; i++) {
            console.log('hi');
            io.to(peopleOnTheMission[i]).emit('passOrFail');
        }
        await updateDatabase()
    })

    socket.on('passOrFail', async (passFail) =>{
        await fetchDatabase()
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
            io.in(socketRoom).emit('missionOver', {data: passOrFail, missionStatus: missionStatus})
        }
        await updateDatabase()
    })

    socket.on("chosen", async (data) => {
        await fetchDatabase()
        io.in(socketRoom).emit('chosen', data)
        peopleOnTheMission.push(data)
        await updateDatabase()
    })

    socket.on("readyUp", async () => {
        await fetchDatabase()
        console.log('Data Fetched')
        if (!readyUpId.includes(socket.id)) {
            readyUpId.push(socket.id)
            readyUpCount = readyUpCount + 1;
            console.log(readyUpId)
        }
        if (readyUpCount == 2) {
            console.log('2 people have readied up!')
            readyUpId = []
            readyUpCount = 0
            io.in(socketRoom).emit("readyUp", {order: orderedSocketID})
        }

       await updateDatabase();


    })

    socket.on("readyUpSetUp", async () => {
        await fetchDatabase()
        console.log('Data Fetched')
        randNum = getRndInteger(0, characters.length)
        character = characters[randNum]
        characters.splice(randNum, 1)
        characterDict = {"id": socket.id, "character": character}
        charAssignments.push(characterDict)
        socketId.push(socket.id)
        console.log('before')
        console.log(readyUpCount)
        if (!readyUpId.includes(socket.id)) {
            readyUpId.push(socket.id)
            readyUpCount = readyUpCount + 1;
            console.log(readyUpId)
        }
        console.log('after')
        console.log(readyUpCount)
      
        if (readyUpCount == 2) {
            console.log('2 people have readied up!')
            readyUpId = []
            readyUpCount = 0
            orderedSocketID = shuffle(socketId)
            io.in(socketRoom).emit("readyUp", {order: orderedSocketID})
        }

       await updateDatabase();


    })


});