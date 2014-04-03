var http = require('http'),
    director = require('director');

var _global_ = 0;

//Actual Server Code to handle URl Request
var router = new director.http.Router();
var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) {   
    if(err	) {
      console.log(" Unwarrented Url " ) ;
      this.res.end(" Illegal Url Calls \n");
    }
  });
});

//Functions to Synchonise Clock Depending on who is the master
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


//Generated Random Variables 
function getrandom() {
  var max = 100000 ;
  var min = 0 
  return Math.random() * (max - min) + min ;
}

/*
Function to compare individual data.ob{1,2,3} values 
If they happen to be undefined, if the process crashes, its 
set = -1 
*/
function cmp(a,b,c) {
 if (!a) { a = -1 ; }
 if (!b) { b = -1 ; }
 if (!c) { c = -1 ; }

 if (a > b && a > c ) return "ob1" ;
 if (b > a && b > c) return  "ob2" ;
 else return "ob3" ;
}



var io = require('socket.io').listen(server,{ log: false });


/*
Channel 1 : Coordinate 
            - Fetch all the nodes count to synch with 
            - Have the random id sent to to Ob1 master 

Ob1 decides who is the master 

Channel 2: Master 
            - Broadcast to all the listeners on who is the master

Repeat this cycle every 5 seconds 
*/


io.sockets.on('connection', function (socket) {
    

    socket.on('coordinate' , function (data) {
       var a = getrandom();
       console.log(" ob1: ", a);
       var m = cmp(data.ob1,data.ob2,data.ob3);
       console.log(" The master is ",m);
       socket.emit('master',m);

       setInterval(function () {
          a = getrandom();
          console.log("after 2 seconds this is my pid", a);
          socket.emit('coordinate' , {'ob1': a}) 
        }, 5000);
       
    });

    socket.on('master', function (data) {
      var funcid ;
      console.log(data, "is the master for now");
      if(data != "ob1") {
        funcid = setInterval(sync,1000);
      }
      else {
        console.log("stopping client sync, since I am master now");
        clearInterval(funcid);
      }
    });

    socket.on('ntp:client_sync', function (data) {
    	console.log("Current server timestamp is ", Date.now() , "order no is " , ++_global_);
    	socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 ,
                                     ord: _global_ });
  	
  	});


    socket.on('error' , function (){
      console.log("Unable to Connect to Front End Server");
    });

});


server.listen(8590);