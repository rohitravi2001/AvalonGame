import socketio
import random

# standard Python
sio = socketio.Client()
myID = ""
    
    
@sio.event
def connect():
    print("I'm connected!")

@sio.event
def readyUp(data):
    order = data['order']
    print(order)
    print("Leader is " + order[0])
    leader = order[0]
    if (myID == leader):
        print("Choose who you want to go on the mission!")
        chosen = input()
        sio.emit('chosen',order[int(chosen)]) 

@sio.event
def missionAccepted(data):
    peopleOnTheMission = data['data']
    leader = data['leader']
    print('The mission has been accepted!')
    print('The people on the mission will be ' + str(peopleOnTheMission))
    print('Please wait for the mission to proceed!')
    if(myID == leader):
        sio.emit('letMissionProceed')

@sio.event
def passOrFail():
    print('Do you choose to pass or fail the mission?')
    passFail = input()
    if(passFail == 'p'):
        sio.emit('passOrFail', 1)
    else:
        sio.emit('passOrFail', 0)

@sio.event
def missionOver(data):
    print('Here are the results of the mission!')
    print(data['missionStatus'])
    print('Are you ready to continue?')
    s = input()
    if (s == 'r'):
        sio.emit("readyUp")


@sio.event
def chosen(data):
    print(data + " has been chosen for the mission!")
    print("Do you accept or reject?")
    rejectOrAccept = input()
    if (rejectOrAccept == "y"):
        sio.emit('rejectOrAccept', 1)
    else:
        sio.emit('rejectOrAccept', 0)

@sio.event
def charAssigned(data):
    print(data)

def main():
    sio.connect('http://localhost:5000')



if __name__ == '__main__':
    main()
    print(sio.get_sid("/"))
    myID = sio.get_sid("/")
    print("Do you want to join or create a room?")
    createOrJoin = input()
    if createOrJoin == 'c':
        #roomNumber = random.randint(1000,9999)
        #print(str(roomNumber )+ " room created")
        sio.emit('createRoom')
    else:
        print('What room would you like to join?')
        roomNumber = int(input())
        print(str(roomNumber) + " room joined")
        sio.emit('joinRoom', roomNumber)
    print("Do you want to ready up?")
    s = input()
    if (s == 'r'):
        sio.emit("readyUpSetUp")
   # print('What data would you like to send?')
    #data = input()
    #sio.emit('message', data)
    #sio.wait()

