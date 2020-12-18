const socket = io()
const peers = {}
const Room = new URLSearchParams(window.location.search).get('room')

const myPeer = new Peer(); 
myPeer.on('open', id => {
    console.log("hi")
    socket.emit('JoinRoom', Room, id)
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
      
        peers[userId] = call
    })
})

socket.on('UserDisconnected', id => {
    if (peers[id]) peers[id].close()
})