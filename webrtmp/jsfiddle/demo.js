/* eslint-env browser */

let pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ]
})
var log = msg => {
  document.getElementById('logs').innerHTML += msg + '<br>'
}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {

    document.getElementById('video1').srcObject = stream
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.createOffer().then(d => pc.setLocalDescription(d)).catch(log)
  }).catch(log)

pc.oniceconnectionstatechange = e => log(pc.iceConnectionState)
pc.onicecandidate = event => {
  if (event.candidate !== null) {
    return
  }
  const localDesc = btoa(JSON.stringify(pc.localDescription))
  document.getElementById('localSessionDescription').value = localDesc

  console.log('fetching')
  fetch('/webrtc/offer', {
    method: 'POST',
    body: localDesc
  }).then(res => {
    console.log('fetched')
    if (res.status !== 200) {
      throw new Error('Error response from server: '+res.status)
    }
    return res.text()
  }).then(remoteDesk => {
    document.getElementById('remoteSessionDescription').value = remoteDesk
  }).catch(log)
}

window.startSession = () => {
  let sd = document.getElementById('remoteSessionDescription').value
  if (sd === '') {
    return alert('Session Description must not be empty')
  }

  try {
    pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(sd))))
  } catch (e) {
    alert(e)
  }
}
