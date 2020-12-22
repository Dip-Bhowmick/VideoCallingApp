const socket = io()
const peers = {}
const RoomAndPass = window.location.pathname.split('/')[1].split('+',2)
const Room = RoomAndPass[0]
const Pass = RoomAndPass[1]
document.getElementById('RoomInfo').innerHTML = `RoomID: ${Room} <br>Password: ${Pass}`
document.getElementById('Link').innerHTML = `Link: <a href="${window.location.href}">${window.location.href}</a>`

const peerOption = {
    debug : 1,
    path : '/PeerServer',
    host : window.location.hostname,
}
//if (parseInt(window.location.port)) peerOption["port"] = parseInt(window.location.port)
const myPeer = new Peer(null,peerOption)
myPeer.on('open', id => {
    socket.emit('JoinRoom', Room, Pass, id)
})


navigator.mediaDevices.getUserMedia({video: true,audio: true}).then(stream => {
    
    const myVideo = document.createElement('video')
    myVideo.muted = true
    myVideo.srcObject = stream
    myVideo.addEventListener('loadedmetadata', () => {
    myVideo.play()
    })
    document.getElementById('video-grid').append(myVideo)
 
  
    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        video.srcObject = userVideoStream
        video.addEventListener('loadedmetadata', () => {
        video.play()
        })
        document.getElementById('video-grid').append(video)
      })
      call.on('close', () => {
        video.remove()
      })
      
      peers[call.peer] = call
    })
  
    socket.on('NewUser',id => {
        const call = myPeer.call(id, stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            video.srcObject = userVideoStream
            video.addEventListener('loadedmetadata', () => {
            video.play()
            })
            document.getElementById('video-grid').append(video)
        })
        call.on('close', () => {
          video.remove()
        })
      
        peers[id] = call
    })
})

socket.on('UserDisconnected', id => {
    if (peers[id]) peers[id].close()
})
