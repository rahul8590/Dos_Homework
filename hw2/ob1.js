var http = require('http'),
    director = require('director');

var _global_ = 0;


var router = new director.http.Router();
var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) {   
    if(err	) {
      console.log(" Unwarrented Url " ) ;
      this.res.end(" Illegal Url Calls \n");
    }
  });
});



function getrandom() {
  var max = 100000 ;
  var min = 0 
  return Math.random() * (max - min) + min ;
}

var io = require('socket.io').listen(server,{ log: false });

io.sockets.on('connection', function (socket) {
    
    socket.on('ntp:client_sync', function (data) {
    	console.log("Current server timestamp is ", Date.now() , "order no is " , ++_global_);
    	socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 ,
                                     ord: _global_ });
  	
  	});

});


server.listen(8590);