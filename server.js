
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
    function(err, fileContents) {
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
  function(socket) {

    console.log("We have a new client: " + socket.id);
    socket.on('new peer',function(data){
    //  console.log("new peer id:" + peerid);

    var newPeer = {
      id: socket.id,
      peerid: data.id,
      img: data.img
    }
    //store in server
    peers.push(newPeer);
    console.log("Peer array: "+ peers);

  //  socket.emit('new peer enter',newPeer);
    socket.emit('new peer enter',peers);
    socket.broadcast.emit('new peer enter to all',peers);

    // socket.on('new peer enter', function(ids){
    //   console.log("peer id: " + data.peerid + "    socketid: " + data.id);
    //
    // });

    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });

   });
  }
);
