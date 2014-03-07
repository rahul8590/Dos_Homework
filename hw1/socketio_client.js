var stdio = require("stdio");
var ops = stdio.getopt({
	'event_type': {key: 'e', args: 1, description: 'Name of event (curling.skiing)'},
    'host': {key: 'h', args: 1, mandatory: true, description: 'Name of the director_server (give localhost if same system)'}
});


console.log("Initializing Client ")
var event_type = ops.event_type;
console.log("subscribing to " , event_type);

var io = require('socket.io-client'),

socket = io.connect(ops.host, {
    port: 8080
});

socket.on('connect',function () {
	console.log("connected to event server");
});

socket.on('error', function () {
	console.log("Unable to Connect to Main Server");
});

socket.on(event_type, function (data) {
        console.log(process.hrtime()[0] , data);
        //socket.emit('my other event', { my: 'data' });
});

socket.on('disconnect' , function () {
	console.log("server has disconnected . goodbye ");
	process.exit();
});

