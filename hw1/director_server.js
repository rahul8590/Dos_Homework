
console.log("                   Welcome to Winter Olympics           ")
console.log("                         ---------- __o");
console.log("                       --------  _ \<,_");
console.log("                     -------    (*)/ (*)");


var _global_ = 0 ; 

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
            if (TeamName in byTeamName) { // You could also use byTeamName.hasOwnProperty(TeamName) here
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
        },
        getByGold: function(Gold) {
            return byGold[Gold-1];
        }
    };
})();


store.add("gual",1,1,1);
store.add("rome",2,2,2);

var http = require('http'),
    director = require('director');


var router = new director.http.Router();

router.get('/getinfo/:teamname', function main(teamname) {
  var ans = JSON.stringify(store.getByTeamName(teamname));
  this.res.end(ans);
  console.log("exe main function", teamname);
  _global_++ ;
});

router.get('/getscore/:eventname', function main(eventname) {
  this.res.end("connected to server");
  console.log("exe main function", eventname);
  _global_++ ;
});

router.get('/inc/:teamname/:medal', function main(teamname,medal) {
  store.incrementMedalTally(teamname,medal);  
  var ans = JSON.stringify(store.getByTeamName(teamname));
  this.res.end(ans);
  console.log("Incremented medal count for a team");
  _global_++ ;
});

var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) { 
    if(err) {
      console.log(" something is screwed up " ) ;
      _global_++ ;
    }
  });
});



var io = require('socket.io').listen(server,{ log: false });

io.sockets.on('connection', function (socket) {
    
    setInterval(function () {
        socket.emit('news', { hello: 'world' });
    },2000);
    /*socket.on('my other event', function (data) {
            console.log(data);
              });*/
});





setInterval(function () {
    console.log(" number of request so far" ,_global_);
},5000);

server.listen(8080);


