var http = require('http'),
    director = require('director');


var router = new director.http.Router();
var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) {   
    if(err	) {
      console.log(" Unwarrented Url " ) ;
      this.res.end(" Illegal Url Calls \n");
    }
  });
});


var io = require('socket.io').listen(server,{ log: false });

io.sockets.on('connection', function (socket) {
    
    socket.on('ntp:client_sync', function (data) {
    	console.log("Current server timestamp is ", Date.now());
    	socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 });
  	
  	});

});


server.listen(8590);