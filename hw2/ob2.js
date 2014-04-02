var offsets = [] ;

function getrandom() {
  var max = 100000 ;
  var min = 0 
  return Math.random() * (max - min) + min ;
}

    
var sync = function () {
    socket.emit('ntp:client_sync', { t0 : Date.now() });
  };


var onSync = function (data) {

    var diff = Date.now() - data.t1 + ((Date.now() - data.t0)/2);

    offsets.unshift(diff);

    if (offsets.length > 10)
      offsets.pop();

  	console.log("Order no ",data.ord,"The offset is ",offsets[0] ,"time in server was = ",data.t1 , "time in the slave = ", Date.now() );
  };

var pcoordinate = function () {
  var a = getrandom();
  console.log(" my pid is ",a);
  socket.emit('coordinate', {'ob2': a });
}

var io = require('socket.io-client'),
socket = io.connect("localhost", {
    port: 8590
});

socket.on('connect',function () {
	socket.on('ntp:server_sync', onSync);
  
	//setInterval(sync,1000);
  setInterval(pcoordinate,1000);

});	

socket.on('coordinate' , function (data) {
  console.log("received some pid", data);
  var a = getrandom();
  console.log("my current pid is ", a);
  if (a > data.ob1) {
    console.log("ob2 is the master ");  
  }
  else {
    console.log("ob1 is master");
  }
});

socket.on('error', function () {
	console.log("Unable to Connect to director Server");
});


