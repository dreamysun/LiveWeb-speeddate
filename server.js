var https = require('https');
var fs = require('fs'); // Using the filesystem module
var url = require('url');

var options = {
  key: fs.readFileSync('my-key.pem'),
  cert: fs.readFileSync('my-cert.pem')
};

function handleIt(req, res) {
  var parsedUrl = url.parse(req.url);

  var path = parsedUrl.pathname;
  if (path == "/") {
    path = "index.html";
  }

  fs.readFile(__dirname + path,

    // Callback function for reading
    function (err, fileContents) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + req.url);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200);
      res.end(fileContents);
    }
  );

  // Send a log message to the console
  console.log("Got a request " + req.url);
}

var httpServer = https.createServer(options, handleIt);
httpServer.listen(8081);

console.log('Server listening on port 8081');

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
var peers = [];

io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {

    console.log("We have a new client: " + socket.id);
    socket.on('new peer', function (data) {
      //  console.log("new peer id:" + peerid);
      var newPeer = {
        id: socket.id,
        peerid: data.id,
        img: data.img
      }
      //store in server
      peers.push(newPeer);
      console.log("Peer array: " + peers);
      socket.emit('new peer enter', peers);

      //broadcast to all
      setTimeout(
        function () {
          socket.broadcast.emit('new peer enter to all', peers);
        }, 1000);

      let rooms = [];
      //who's talking with whom
      socket.on('onConvo', data => {
        let room = {
          user1: socket.id,
          user2: data,
          user1enjoy: false,
          user2enjoy: false
        }
        rooms.push(room);
        console.log(rooms);
        // console.log('onConvo = user ' + socket.id)
        // console.log('onConvo = user ' + data);

        //enjoy talking and matched
        socket.on('enjoyTalking', data => {
          console.log('socket ' + socket.id + ' enjoys the convo');
          console.log(data);
          rooms.forEach(room => {
            if (socket.id == room.user1) {
              user1enjoy = true;
            }
            if (socket.id == room.user2) {
              user2enjoy = true;
            }
          })
        });
      })

      rooms.forEach(room => {
        if (room.user1enjoy == true && room.user2enjoy == true) {
          socket.emit('matched', console.log('we got a match'));
        }
      })

      //on disconnet
      socket.on('disconnect', function () {
        console.log("Client has disconnected");
        for (let i = 0; i < peers.length; i++) {
          //if the user is a player, remove it from the players list
          if (peers[i].id == socket.id) {
            console.log(peers[i].id);
            console.log(i);
            peers.splice(i, 1);
            console.log("a player is disconnected");
            socket.emit('new peer enter', peers);
            socket.broadcast.emit('new peer enter to all', peers);
          };
        }
      });

    });
  }
);
