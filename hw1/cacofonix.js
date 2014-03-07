/*

Cacophonix Server 

update the server push notifications 
set_score()
incrementMedalTally()

*/



var events = require("events");  
var stdio = require("stdio");
var ops = stdio.getopt({
	'action_type': {key: 'a', args: 1, description: 'Name of action (inc_medal,set_score)'},
    'event_name': {key: 'e', args: 1, description: 'Name of event'},
    'teamname': {key: 't', args:1 ,description: 'Name of the team'},
    'medal_type': {key: 'm',args: 1, description: 'Type of medal example gold,silver,bronze'},
    'score' : {key: 's', args: 2 , description: 'enter scores of 2 teams (rome , gual)'},
    'interval' : {key : 'i' , args: 1 , description: 'No of times you need to send update'},
    'host': {key: 'h', args: 1, mandatory: true, description: 'localhost if same server' }
});

console.log("Initializing Client ");


var channel = new events.EventEmitter();

channel.on('inc_medal',function () {
	socket.emit("inc_medal", { teamname : ops.teamname , medal: ops.medal_type });
});

channel.on('set_score',function () {
	console.log("setting score for a given teamname " , process.hrtime()[0]);
    socket.emit("set_score", { eventname: ops.event_name , rome : ops.score[0] , gual: ops.score[1]});
});

channel.on ("end" , function () {
	process.exit();
})

console.log("subscribing to " , ops.action_type);

var io = require('socket.io-client'),
socket = io.connect(ops.host, {
    port: 8080
});

socket.on('connect',function () {
	console.log("connected to director server");
	if (ops.interval) {
		for (var i =0; i < ops.interval ; i++) {
			channel.emit(ops.action_type);		
		}
	}
	else { channel.emit(ops.action_type);
	}
	channel.emit("end");
});	

socket.on('error', function () {
	console.log("Unable to Connect to director Server");
});

socket.on(ops.action_type, function (data) {
        console.log(data);
});

socket.on('disconnect' , function () {
	console.log("server has disconnected . goodbye ");
	process.exit();
});

