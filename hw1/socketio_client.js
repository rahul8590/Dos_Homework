console.log("Initializing Client ")

var io = require('socket.io-client'),

//socket = io.connect('http://localhost:8080');

socket = io.connect('localhost', {
    port: 8080
});

socket.on('connect',function () {
	console.log("connected to event server");
});

socket.on('error', function () {
	console.log("Unable to Connect to Main Server");
});

socket.on('news', function (data) {
        console.log(data);
        //socket.emit('my other event', { my: 'data' });
});

socket.on('disconnect' , function () {
	console.log("server has disconnected . goodbye ");
	process.exit();
});

