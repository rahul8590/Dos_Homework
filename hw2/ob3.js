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


