//update the server push notifications 
//set_score()
//incrementMedalTally()
//

//Cacophonix Server 

console.log("Initializing Client ")
var event_type = process.argv[2];
console.log("subscribing to " , event_type);

var io = require('socket.io-client'),

socket = io.connect('localhost', {
    port: 8080
});

socket.on('connect',function () {
	console.log("connected to director server");
	socket.emit("update_cacophonix", { event_name : "scores"});
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

