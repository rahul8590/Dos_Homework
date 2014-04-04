var stdio = require("stdio");
var ops = stdio.getopt({
  'rserver': {key: 'rserver', args: 1, description: 'Name of action (inc_medal,set_score)'},
  'rport': {key: 'rport', args: 1, description: 'Name of event'},
  'host': {key: 'host', args: 1, description: 'In case of multi-node deployment'},
  'ob3' : {key: 'ob3', args: 1, description: 'full domain name of ob3 server'}
});

ops.ob3 = typeof ops.ob3 !== 'undefined' ? ops.ob3 : 'localhost';



var http = require('http'),
    director = require('director'),
    request = require('request');

var _global_ = 0;

var events = require("events");
var channel = new events.EventEmitter();
var fecount = 0;

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
  fecount++;
  console.log("into get request");
  var ans = request.get("http://"+ops.ob3+":8080/getinfo/"+teamname).pipe(this.res);
});


/*Creating Router Routes (dispatch)
/getscore/curling
/getscore/skiing
*/
router.get('/getscore/:eventname', function main(eventname) {
  fecount++;
  var ans = request.get("http://"+ops.ob3+":8080/getscore/"+eventname).pipe(this.res);
});






//Functions to Synchonise Clock Depending on who is the master
//var sync = function () {
//    csocket.emit('ntp:client_sync', { t0 : Date.now() });
//};

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



/*Redis Based Pub-Sub System to Initially Select the Master Bully 
and synch server timestamps 
*/
var Ipc = require('./ipc/ipc.js');
var serverId = getrandom();
console.log("My server id is",serverId);
var ipc = new Ipc(serverId);


// Mark the process to be online in the cluster
ipc.markProcessOnline( function() {
  // Now that we are online we will run for president
    ipc.runForPresident();
});

// 'won' event is emited if we win (daaah) the elections
ipc.on('won', function() {
  console.log("I am the Master Now . . . \m/ ");
  ipc.sendMessageToAll({servername:'ob1', 'port': 8590});
});

// 'lost' ... Well you get it
ipc.on('lost', function() {
  console.log("I've lost the Master Elections :( ");
});

// 'dead' event is emited when a dead node has been detected. The IPC library
// is responsible for cleaning up the cluster while you clean up your application
ipc.on('dead', function( data ) {
  console.log("A Server has died, may it RIP ", data);
});


// A message has arrived for me...
ipc.on('message', function(data) {
  //ioc.server.close();
  if (data.servername != 'ob1') {
    console.log("entering message section",data);
    // Initiate Synch Mechanism with that server 
      var ioc = require('socket.io-client');    
      var tsocket = ioc.connect("localhost", {
        port: data.port
    },{'force new connection' : true });

    tsocket.on('connect',function () {
      setInterval(function(){   
        if(!tsocket.disconnected){
          tsocket.on('ntp:server_sync', onSync);
          tsocket.emit('ntp:client_sync', { t0 : Date.now() }); // We can add intervals later.
        }      
      },1000);         
    });

    /*tsocket.on('message',function (msg) {
        tsocket.on('ntp:server_sync', onSync);
        tsocket.emit('ntp:client_sync', { t0 : Date.now() }); // We can add intervals later.

    });*/

    tsocket.on('error',function() {
      console.log("reconnect error => just disconnecting");
      //tsocket.socket.reconnect();
      tsocket.disconnect();
    });

    tsocket.on('connect_error',function(err) {
      console.log("connect error => just disconnecting");
      console.log(err);
      //tsocket.socket.reconnect();
      tsocket.disconnect();
    });

    tsocket.on('disconnect',function() {
      console.log("just disconnecting");
      //tsocket.socket.reconnect();
      tsocket.disconnect();
    });
  }

});




var ios = require('socket.io').listen(server,{ log: false });

ios.sockets.on('connection', function (socket) {
  
  console.log("time server connected and listening");
  
  socket.on('ntp:client_sync', function (data) {
      console.log("Current server timestamp is ", Date.now() , "order no is " , ++_global_);
      socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 ,
                                     ord: _global_ });
      //socket.disconnect();
    });
    
    socket.on('error', function (data){
      console.log("reconnecint error in the main server");
      socket.disconnect();
    });

    socket.on('message', function (data){
      console.log("message error in the main server");
      socket.disconnect();
    });
  /*socket.on('error',function() {
      console.log("unable to connect for some reason, retrying");
      socket.socket.reconnect();
    });*/
});



server.listen(8590);

process.on('SIGINT', function() {
  console.log("No of Client request Server ",fecount);
  process.exit();
});

