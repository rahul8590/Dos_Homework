var http = require('http'),
    director = require('director'),
    request = require('request');

var _global_ = 0;

var events = require("events");
var channel = new events.EventEmitter();


//Actual Server Code to handle URl Request
var router = new director.http.Router();
var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) {   
    if(err) {
      console.log(" Unwarrented Url " ) ;
      console.log(req.url);
      this.res.end(" Illegal Url Calls \n");
    }
  });
});

/*Creating Router Routes (dispatch)
/getinfo/rome
/getinfo/gual
*/
router.get('/getinfo/:teamname', function main(teamname) {
  var ans = request.get("http://localhost:8080/getinfo/"+teamname).pipe(this.res);
});


/*Creating Router Routes (dispatch)
/getscore/curling
/getscore/skiing
*/

router.get('/getscore/:eventname', function main(eventname) {
  var ans = request.get("http://localhost:8080/getscore/"+eventname).pipe(this.res);
});






//Functions to Synchonise Clock Depending on who is the master
var sync = function () {
    csocket.emit('ntp:client_sync', { t0 : Date.now() });
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

var offsets = [] ;



// 8590 Server is acting as a client in order to sync with 8591 server
var ioc = require('socket.io-client'),
csocket = ioc.connect("localhost", {
    port: 8591
});

csocket.on('connect',function () {
    console.log("connected to ob2 time server");
    //channel.emit('start_time_client');
});

channel.on('start_time_client', function () {
    csocket.on('ntp:server_sync', onSync);
    csocket.emit('ntp:client_sync', { t0 : Date.now() });
    //sync();
    //setInterval(sync,1000); 
    
});


csocket.on('error' , function(err) {
  console.log("unable to connect to ob2 time server");
  csocket.socket.reconnect(); 
  channel.emit('start_time_client');
});








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
    
    var funcid ;

    socket.on('coordinate' , function (data) {
       var a = getrandom();
       console.log(" ob1: ", a);
       console.log("ob2: ", data.ob2);  
       var m = cmp(a,data.ob2,data.ob3);
       console.log(" The master is ",m);
       socket.emit('master',m);

    /*funcid =   setInterval(function () {
          a = getrandom();
          console.log("after 5 seconds this is my pid", a);
          socket.emit('coordinate' , {'ob1': a}) 
        }, 5000);
      */


    });

    socket.on('master', function (data) {
      
      console.log(data, "is the master for now");
      if(data != "ob1") {
        //sync();
        console.log("entering data!=ob1 constraints ");
        channel.emit('start_timer_client');

      }
      else {
        console.log("stopping client sync, since I am master now");
        a = getrandom();
        socket.emit('coordinate' , {'ob1': a}) ;
      }
    });


    socket.on('sync_with_master' , function () {
        channel.emit('start_timer_client');
    });



    console.log("time server connected and listening");

    socket.on('ntp:client_sync', function (data) {
    	console.log("Current server timestamp is ", Date.now() , "order no is " , ++_global_);
    	socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 ,
                                     ord: _global_ });
      a = getrandom();
      socket.emit('coordinate' , {'ob1': a}) ;
  	
  	});


    socket.on('error' , function (){
      console.log("Unable to Connect to Front End Server");
    });

});


server.listen(8590);