/*

Active client Subscribing to various Events

USAGE: node socketio_client.js [OPTIONS] , where OPTIONS are:
  -e, --event_type <ARG1> Name of event (curling,skiing)
  -h, --host <ARG1> Name of the director_server (give localhost if same system) (mandatory)

Author: rahulram@cs.umass.edu

*/

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
        console.log("nanosecond time =>", process.hrtime()[0] , data);
});

socket.on('disconnect' , function () {
	console.log("server has disconnected . goodbye ");
	process.exit();
});

