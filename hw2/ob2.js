var http = require('http'),
    director = require('director'),
    request = require('request');

var _global_ = 0;

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

server.listen(8591);















var offsets = [] ;


function cmp(a,b,c) {
 if (!a) { a = -1 ; }
 if (!b) { b = -1 ; }
 if (!c) { c = -1 ; }

 if (a > b && a > c ) return "ob1" ;
 if (b > a && b > c) return  "ob2" ;
 else return "ob3" ;
}

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





//Adding server functioality when this instance becomes the time_server
var ios = require('socket.io').listen(server,{ log: false });

ios.sockets.on('connection', function (socket) {
  /*some code */
  socket.on('ntp:client_sync', function (data) {
      console.log("Current server timestamp is ", Date.now() , "order no is " , ++_global_);
      socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 ,
                                     ord: _global_ });
    
    });
});





// 8591 Server is acting as a client in order to sync with 8590 server

var ioc = require('socket.io-client'),
socket = ioc.connect("localhost", {
    port: 8590
});


socket.on('connect',function () {
	//setInterval(sync,1000);
  setInterval(pcoordinate,10000);
});	

socket.on('ntp:server_sync', onSync);

socket.on('coordinate' , function (data) {
  console.log("received some pid", data);
  var a = getrandom();
  console.log("my current pid is ", a , "data.ob1 is ", data.ob1);
  var m = cmp(data.ob1,a,data.ob3);
  console.log(m,"is the master");  
});

socket.on('master',function (data) {
   var funcid ;
   if(data != "ob2") {
    console.log("entering data!=ob2 constraints ");
    funcid = setInterval(sync,2000);
   }
   else {
    console.log("stopping client sync, since I am master now");
    clearInterval(funcid);
   }
});




socket.on('error', function () {
	console.log("Unable to Connect to Front End Server");
});


