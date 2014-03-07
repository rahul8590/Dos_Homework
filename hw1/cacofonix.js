//update the server push notifications 
//set_score()
//incrementMedalTally()
//

//Cacophonix Server 

console.log("Initializing Client ")
var events = require("events");  
var event_type = process.argv[2];
var channel = new events.EventEmitter();

channel.on('inc_medal',function () {
	socket.emit("inc_medal", { teamname : "gual" , medal: "gold" });
});

channel.on('set_score',function () {
	console.log("setting score for a given teamname ");
  socket.emit("set_score", { eventname: "event_name" , rome : "score " , gual: "score"});
});

console.log("subscribing to " , event_type);

var io = require('socket.io-client'),

socket = io.connect('localhost', {
    port: 8080
});

socket.on('connect',function () {
	console.log("connected to director server");
	channel.emit('inc_medal');
});	

socket.on('error', function () {
	console.log("Unable to Connect to director Server");
});

socket.on(event_type, function (data) {
        console.log(data);
        //socket.emit('my other event', { my: 'data' });
});

socket.on('disconnect' , function () {
	console.log("server has disconnected . goodbye ");
	process.exit();
});

