var ntp  = {}
    , offsets = [] ;
    


 var sync = function () {
    socket.emit('ntp:client_sync', { t0 : Date.now() });
  };


 var onSync = function (data) {

    var diff = Date.now() - data.t1 + ((Date.now() - data.t0)/2);

    offsets.unshift(diff);

    if (offsets.length > 10)
      offsets.pop();

  	console.log("The offset is ",offsets[0] ,"time in server was = ",data.t1 , "time in the slave = ", Date.now() );
  };


var io = require('socket.io-client'),
socket = io.connect("localhost", {
    port: 8590
});

socket.on('connect',function () {
	socket.on('ntp:server_sync', onSync);
	setInterval(sync,1000);
});	

socket.on('error', function () {
	console.log("Unable to Connect to director Server");
});

