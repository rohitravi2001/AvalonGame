const mongoose = require('mongoose')

const dataObj = new mongoose.Schema({
    socketId: Array,
    charAssignments: Array,
    orderedSocketID: Array,
    readyUpId: Array,
    readyUpCount: Array,
    rejectOrAcceptCount: Number,
    rejectOrAccept: Number, 
    var peopleOnTheMission = []
    var passFailCount = 0
    var passOrFail = []
    var roundsStatus = []
    var roomNumbers = []
    var socketIDtoRoom = {};
})

const AvalonSchema = new mongoose.Schema({
    name: String
    //var socketId = []
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
    // var socketIDtoRoom = {};
})

const model = mongoose.model('AvalonModel', AvalonSchema)

module.exports = model