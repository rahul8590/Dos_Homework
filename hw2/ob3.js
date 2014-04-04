console.log("                   Welcome to Summer Olympics           ")
console.log("                         ---------- __o");
console.log("                       --------  _ \<,_");
console.log("                     -------    (*)/ (*)");


var _global_ = 0 ; 


/* Data structure to store TeamName and the Medal Scores with it.
Methods :
Add()
getByTeamName()
incrementMedalTally()
*/

var store = (function() {
    var byGold = [];
    var byTeamName = {};

    return {
        add: function(TeamName, Gold, Bronze, Silver) {
            var d = {
                TeamName: TeamName,
                gold: Gold,
                bronze: Bronze,
                silver: Silver
            };
            if (TeamName in byTeamName) { 
                byTeamName[TeamName].pop();
                byTeamName[TeamName].push(d);
            } else {
                byTeamName[TeamName] = [];
                byTeamName[TeamName].push(d);
            }
            byGold[Gold-1] = d;
        },
        getByTeamName: function(TeamName) {
            if (TeamName in byTeamName) {
                return byTeamName[TeamName];
            }
            return null;
        },
        incrementMedalTally: function(TeamName,MedalType) {
          if(TeamName in byTeamName) {
            temp = byTeamName[TeamName].pop();
            temp[MedalType]++;
            byTeamName[TeamName].push(temp);
          }
        }
    };
})();

/*Datastructures to store the Event Scores for Team Rome and Gual
Methods:
Add(Eventname,Team1_Score , Team2_Score) => Add scores for a particular event 
getByEventName() => Get Event Scores based on event (curling,skiing)
*/
var score = (function() {
    var byTeamName = [];
    var byEventName = {};

    return {
        add: function(EventName, Team1, Team2) {
            var d = {
                eventname: EventName,
                rome: Team1,
                gual: Team2,
            };
            if (EventName in byEventName) { 
                byEventName[EventName].pop();
                byEventName[EventName].push(d);
            } else {
                byEventName[EventName] = [];
                byEventName[EventName].push(d);
            }
            //byTeamName[Team1-1] = d;
        },
        getByEventName: function(EventName) {
            if (EventName in byEventName) {
                return byEventName[EventName];
            }
            return null;
        }
    };
})();


// Initializing the Teams and Then Individual Score Events 
store.add("gual",0,0,0);
store.add("rome",0,0,0);

score.add("curling",0,0);
score.add("skiing",0,0);


console.log (" Initializing Teams with the following Scores ");
console.log("gual => 0 , 0 , 0 (gold,silver,bronze");
console.log("rome => 0 , 0 , 0 (gold,silver,bronze");
console.log("Initializing Scores for the Following Events ") ;
console.log("curling => rome: 0 , gual : 0 ");
console.log("skiing => rome: 0 , gual : 0  ");





var http = require('http'),
    director = require('director');


var router = new director.http.Router();


/*Creating Router Routes (dispatch)
/getinfo/rome
/getinfo/gual
*/
router.get('/getinfo/:teamname', function main(teamname) {
  var ans = JSON.stringify(store.getByTeamName(teamname));
  this.res.end(ans);
});


/*Creating Router Routes (dispatch)
/getscore/curling
/getscore/skiing
*/

router.get('/getscore/:eventname', function main(eventname) {
  var ans = JSON.stringify(score.getByEventName(eventname));
  this.res.end(ans);
});


var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) {   
    if(err) {
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



var offsets = [] ;

var onSync = function (data) {

    var diff = Date.now() - data.t1 + ((Date.now() - data.t0)/2);
    offsets.unshift(diff);
    if (offsets.length > 10)
      offsets.pop();
    console.log("Order no ",data.ord,"The offset is ",offsets[0] ,"time in server was = ",data.t1 , "time in the slave = ", Date.now() );
};







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
  ipc.sendMessageToAll({servername:'ob3', 'port': 8080});
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
  if (data.servername != 'ob3') {
    // Initiate Synch Mechanism with that server 
    console.log("entering message section",data);
     
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

    tsocket.on('message',function (msg) {
        tsocket.on('ntp:server_sync', onSync);
        tsocket.emit('ntp:client_sync', { t0 : Date.now() }); // We can add intervals later.

    });

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






























var events = require("events");
var channel = new events.EventEmitter();


var io = require('socket.io').listen(server,{ log: false });

io.sockets.on('connection', function (socket) {
    
    console.log("Connected to Client Event Subscriber") ;

    channel.on('curling' , function () {
        console.log("called the channel curling");
        var d = score.getByEventName('curling');
        socket.emit('curling', { 'rome' : d[0].rome , 'gaul' : d[0].gual });
    });

    channel.on('skiing' , function () {
        console.log("called the channel skiing");
        var d = score.getByEventName('skiing');
        socket.emit('skiing', { 'rome' : d[0].rome , 'gaul' : d[0].gual });
    });


    socket.on('inc_medal', function (data) {
            console.log("receiving data from cacophonix server",data);
            store.incrementMedalTally(data.teamname,data.medal);  
            console.log("data is updated");
    });

    socket.on('set_score', function (data) {
      console.log("New Score received from cacophonix server ", data );
      score.add(data.eventname,data.rome,data.gual);
      console.log(data);
      channel.emit(data.eventname);
    });


    //socket.on('ntp:server_sync', onSync);

    socket.on('ntp:client_sync', function (data) {
        console.log("Current server timestamp is ", Date.now() , "order no is " , ++_global_);
        socket.emit('ntp:server_sync', { t1     : Date.now(),
                                     t0     : data.t0 ,
                                     ord: _global_ });
    
    
    });

    socket.on('error', function (data){
      console.log("reconnecint error in the main server");
      socket.disconnect();
    });

    socket.on('message', function (data){
      console.log("message error in the main server");
      socket.socket.reconnect();
    });

    /*socket.on('disconnect', function (data){
      console.log("reconnecint error in the main server");
      socket.disconnect();
    });

    socket.on('reconnect_error', function (data){
      console.log("reconnecint error in the main server");
      socket.disconnect();
    });*/

});


process.on('SIGINT', function() {
    console.log(" \n Caught interrupt signal. Cleaning up all the connections .. Goodbye   \n");
    console.log("                         ---------- __o");
    console.log("                       --------  _ \<,_");
    console.log("                     -------    (*)/ (*)");

    server.close();
    process.exit();
});


server.listen(8080);


