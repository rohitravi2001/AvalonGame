const mongoose = require('mongoose')

const dataObj = new mongoose.Schema({
    socketId: Array,
    charAssignments: Array,
    orderedSocketID: Array,
    readyUpCount: {type: Number, default: 0},
    readyUpId: Array,
    rejectOrAcceptCount: {type: Number, default: 0},
    rejectOrAccept: {type: Number, default: 0}, 
    peopleOnTheMission: Array,
    passFailCount: {type: Number, default: 0},
    passOrFail: Array,
    roundsStatus: Array,
    roomNumbers: Array,
    characters: {type: Array, default: ["Morgana", "Merlin", "Percival", "Mordred", "Citizen"]}
    //socketIDtoRoom: {type: Number, of: Number}
})

const AvalonSchema = new mongoose.Schema({
    roomID: Number,
    data: dataObj
})

const model = mongoose.model('AvalonModel', AvalonSchema)

module.exports = model