//Main obelix server which 
// Stores Team information, 
// For Stone_Curling event 
//register_client() 
//push_updates() 

var net = require('net');
var events = require("events");  

var channel = new events.EventEmitter();

channel.addListener('message', function (msg) {
   console.log('Message: ' + msg.text);
});


var server = net.createServer(function(socket) {
    
    //var id = socket.remoteAddress + ":" + socket.remotePort;
    
    // Bind to the "connect" event.  This is the event that gets emitted when a connection is made.
    socket.on('connect', function() {
        //channel.emit('message', {text: "Client connected: " + id});
        console.log("some client connected");
    });
    
    // Bind to the "close" event.  This is the event that gets emitted when a connection is closed.
    socket.on('close', function() {
        //channel.emit('message', {text: 'Client disconnected: ' + id});
        console.log("received closed");
        channel.emit('shutdown');  //fire the "shutdown event
    });
    
    // Bind to the "data" event.  This is the event that gets emitted when data is available (body/header).
    socket.on('data', function(data) {
        channel.emit('message', {text: data});
        
    });
});

channel.emit('shutdown');  //fire the "shutdown event
server.listen(8590);

// Bind to the "shutdown" event.
channel.on('shutdown', function () {
    this.removeAllListeners();  // removes all listeners
    console.log('Channel shutting down');
    server.close();
});



/*var http = require('http'),
    io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io')

server = http.createServer(function(req, res){
 // your normal server code
 res.writeHead(200, {'Content-Type': 'text/html'});
 res.end('<h1>Hello world</h1>');
});
server.listen(8590);

// socket.io
var socket = io.listen(server);
socket.on('connect', function(client){
  // new client is here!
  console.log('new connection!');
  client.on('message', function(){ console.log('send message') });
  client.on('close', function(){ console.log('disconnect') });
});
*/