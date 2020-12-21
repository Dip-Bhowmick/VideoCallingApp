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

app.use(express.static('public'));
app.use('/', peerServer);

const Rooms = {}

app.get('/',(req,res)=>{
    
    var file = __dirname;
    
    if(!req.query.hasOwnProperty('room') || !req.query.hasOwnProperty('pass'))
        file += '/public/home.html'
    else if(Rooms.hasOwnProperty(req.query.room) && 
        Rooms[req.query.room] == req.query.pass)
        file += '/public/room.html';
    else
        file += '/public/error.html';
    res.sendFile(file);
    
   res.redirect(`${uuid.v4()}`)
})
app.get('/:room',(req,res)=>{
    res.sendFile(__dirname+'/public/room.html')
})

io.on('connection',socket => {
    socket.on('JoinRoom',(Room, id)=>{
        socket.join(Room)
        socket.to(Room).broadcast.emit('NewUser', id)
        socket.on('disconnect', () => {
            socket.to(Room).broadcast.emit('UserDisconnected', id)
            if(io.sockets.adapter.rooms[Room] && io.sockets.adapter.rooms[Room].length == 0)
                delete Rooms[Room]
        })
    })
});

server.listen(PORT);
