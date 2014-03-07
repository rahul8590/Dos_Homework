//update the server push notifications 
//set_score()
//incrementMedalTally()
//

//Cacophonix Server 


var events = require("events");  
var stdio = require("stdio");
var ops = stdio.getopt({
	'action_type': {key: 'a', args: 1, description: 'Name of action (inc_medal,set_score)'},
    'event_name': {key: 'e', args: 1, description: 'Name of event'},
    'teamname': {key: 't', args:1 ,description: 'Name of the team'},
    'medal_type': {key: 'm',args: 1, description: 'Type of medal example gold,silver,bronze'},
    'score' : {key: 's', args: 2 , description: 'enter scores of 2 teams (rome , gual)'},
    'interval' : {key : 'i' , args: 1 , description: 'Interval time for repeated pushses'}
});

console.log("Initializing Client ");
//var event_type = process.argv[2];
var channel = new events.EventEmitter();

channel.on('inc_medal',function () {
	socket.emit("inc_medal", { teamname : ops.teamname , medal: ops.medal_type });
	process.exit();
});

channel.on('set_score',function () {
	console.log("setting score for a given teamname ");
    socket.emit("set_score", { eventname: ops.event_name , rome : ops.score[0] , gual: ops.score[1]});
    process.exit();
});

console.log("subscribing to " , ops.action_type);

var io = require('socket.io-client'),
socket = io.connect('localhost', {
    port: 8080
});

socket.on('connect',function () {
	console.log("connected to director server");
	channel.emit(ops.action_type);
});	

socket.on('error', function () {
	console.log("Unable to Connect to director Server");
});

socket.on(ops.action_type, function (data) {
        console.log(data);
        //socket.emit('my other event', { my: 'data' });
});

socket.on('disconnect' , function () {
	console.log("server has disconnected . goodbye ");
	process.exit();
});

