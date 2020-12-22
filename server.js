const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const uuid = require('uuid');

const PORT = process.env.PORT

const Peer = require('peer');
const peerServer = Peer.ExpressPeerServer(server, {
    path: '/PeerServer',
    debug: 1,
});

const Rooms = {}

app.use(express.static('public'))
//app.use(express.json());       // to support JSON-encoded bodies (fetch)
app.use('/CreateRoom',express.urlencoded({extended: true})); // to support URL-encoded bodies (form)
app.use('/', peerServer)

app.get('/',(req,res)=>{
    res.redirect(`/UUID/${uuid.v4()}`)
})
app.get('/UUID/:UUID',(req,res)=>{
    res.sendFile(__dirname+'/public/home.html')
})
app.post('/CreateRoom',(req,res)=>{
    var uuidv4 = uuid.v4()
    Rooms[uuidv4] = req.body.Pass
    res.redirect(`/${uuidv4}+${req.body.Pass}`)
})
app.post('/JoinRoom',(req,res)=>{
    if(Rooms[req.body.Room] == req.body.Pass)
        res.redirect(`/${req.body.Room}+${req.body.Pass}`)
})
app.get('/:RoomAndPass',(req,res)=>{
    if(Rooms[req.params.RoomAndPass.split('+',2)[0]] == req.params.RoomAndPass.split('+',2)[1])
    res.sendFile(__dirname+'/public/room.html')
    else 
    res.sendFile(__dirname+'/public/error.html')
})

io.on('connection',socket => {
    socket.on('JoinRoom',(Room, Pass, id)=>{
        if (Rooms[Room] == Pass) {
            socket.join(Room)
            socket.to(Room).broadcast.emit('NewUser', id)
            socket.on('disconnect', () => {
                socket.to(Room).broadcast.emit('UserDisconnected', id)
                if(io.sockets.adapter.rooms[Room] && io.sockets.adapter.rooms[Room].length == 0)
                    delete Rooms[Room]
            })
        }
    })
});

server.listen(PORT);
