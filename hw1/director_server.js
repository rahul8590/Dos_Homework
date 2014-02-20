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
            temp.MedalType++;
            byTeamName[TeamName].push(temp);
          }
        }
        getByGold: function(Gold) {
            return byGold[Gold-1];
        }
    };
})();


var http = require('http'),
    director = require('director');

function main() {
  this.res.end("connected to server");
  console.log("exe main function",_global_++);
}

var router = new director.http.Router({
  '/main' : {
    get: main
  }
});

var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) { 
    if(err) {
      console.log(" something is screwed up " ) ;
    }
  });
});

  server.listen(8080);
