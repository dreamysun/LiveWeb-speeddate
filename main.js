//socket.on()


// We'll use a global variable to hold on to our id from PeerJS
var peerData = [];
var mypeerid;
// I setup a peer server on a Digital Ocean instance for our use, you can use that with the following constructor:
var peer = new Peer({host: 'liveweb-new.itp.io', port: 9000, path: '/'});

//socket on
var socket = io.connect();
socket.on('connect', function() {
    console.log("Connected");
});



// Get an ID from the PeerJS server
peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
    mypeerid = id;
    socket.emit('new peer',id);
});

peer.on('error', function(err) {
    console.log(err);
});

//you are a player
socket.on('new peer',function(data){
    console.log("new peer in");
    console.log(data);
});


socket.on('new peer enter',function(data){
    console.log("new peer in");
    //console.log("peer id: " + data.peerid + "    socketid: " + data.id);
    console.log(data);
});



socket.on('new peer enter to all',(data)=>{
    console.log("a new peer joined: "+ data[data.length-1].id + "  peerid    " + data[data.length-1].peerid + "   imagedata   " + data[data.length-1].img);
});





peer.on('call', function(incoming_call) {
    console.log("Got a call!");
    incoming_call.answer(my_stream); // Answer the call with our stream from getUserMedia
    incoming_call.on('stream', function(remoteStream) {  // we receive a getUserMedia stream from the remote caller
        // And attach it to a video object
        var ovideoElement = document.createElement('video');
        // ovideoElemnt.id = "something";
        ovideoElement.srcObject = remoteStream;
        //ovideoElement.src = window.URL.createObjectURL(remoteStream) || remoteStream;
        ovideoElement.setAttribute("autoplay", "true");
        ovideoElement.play();
        document.body.appendChild(ovideoElement);
    });
});

function makeCall(idToCall) {
    var call = peer.call(idToCall, my_stream);

    call.on('stream', function(remoteStream) {
        console.log("Got remote stream");
        var ovideoElement = document.createElement('video');
        ovideoElement.srcObject = remoteStream;
        // ovideoElement.src = window.URL.createObjectURL(remoteStream) || remoteStream;
        ovideoElement.setAttribute("autoplay", "true");
        ovideoElement.play();
        document.body.appendChild(ovideoElement);
    });
}

/* Get User Media */

    let webcamSettings = {
        audio: false,
        video: true,
        width: 360,
        height: 240
    }


    window.addEventListener('load', function () {

      let canvas = document.getElementById('canvas');
      let context = canvas.getContext('2d');
      let webcam = document.getElementById('myvideo');

        //if permission allowed
        navigator.mediaDevices.getUserMedia(webcamSettings)
            .then(function (stream) {

                webcam.srcObject = stream;
                webcam.onloadedmetadata = function (e) {
                    webcam.play();
                }
                setTimeout(
                  function () {
                     //console.log('take a snapshot');
                    //var imageData = context.getImageData(0,0,20,20);
                    context.drawImage(webcam, 0, 0);
                    let snapshot = canvas.toDataURL('image/jpeg');
                    var mypeerData = {
                      id:mypeerid,
                      img:snapshot
                    };
                    console.log(snapshot);
                    peerData.push(mypeerData);
                    socket.emit('new peer', mypeerData);
                }, 1000);
            })


            .catch(function (err) {
                console.log(err);
            })
    })
