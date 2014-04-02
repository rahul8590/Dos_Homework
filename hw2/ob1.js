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


/*
Channel 1 : Coordinate 
            - Fetch all the nodes count to synch with 
            - Have the random id sent to to Ob1 master 

Ob1 decides who is the master 

Channel 2: Coordinate_Confirm 
            - Broadcast to all the listeners on who is the master

Repeat this cycle every 5 seconds 
*/


io.sockets.on('connection', function (socket) {
    

    socket.on('coordinate' , function (data) {
       var a = getrandom();
       console.log(" ob1: ", a);
       if (data.ob2 < a) {
        console.log(" Ob1: I am the master" , a );
       }
       else {
        setInterval(function () {
          socket.emit('coordinate' , {'ob1': getrandom()}) 
        }, 1000);
       }
    });

    socket.on('master', function (data) {
      console.log(data, "is the master for now");
    })

    socket.on('ntp:client_sync', function (data) {
    	console.log("Current server timestamp is ", Date.now() , "order no is " , ++_global_);
    	socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 ,
                                     ord: _global_ });
  	
  	});

});


server.listen(8590);