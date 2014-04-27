var http = require('http'),
    director = require('director'),
    cache = require('memory-cache'),
    events = require("events"),
    redis = require('redis');


var router = new director.http.Router();
var channel = new events.EventEmitter();
var rclient = redis.createClient();




function getscore (eventname){

  rclient.hgetall(eventname,function(err,obj){
        console.log("the response from redis is ",obj)
        cache.put(eventname,obj);
        console.log("inserting to cache");  
        channel.emit('response',obj);
    });

}


/*Creating Router Routes (dispatch)
/getinfo/rome
/getinfo/gual
*/
router.get('/getinfo/:teamname', function main(teamname) {
  var res = cache.get(teamname)
  if (res == undefined){
    rclient.hgetall(teamname,function(err,obj){
        res = obj;
        cache.put(teamname,res);
        console.log("inserting to cache");  
    })
  }
  else {
    console.log("getting value from cache");
  }
  this.res.end(res);
});


/*Creating Router Routes (dispatch)
/getscore/curling
/getscore/skiing
*/

router.get('/getscore/:eventname', function main(eventname) {
  
  console.log("requested eventname is ", eventname)
  var result = cache.get(eventname)
  if (result == undefined){
    result = getscore(eventname);
  }
  else {
    console.log("getting value from cache");
  }
  this.res.end(JSON.stringify(result));
});


var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) {   
    if(err) {
      console.log(" Unwarrented Url " ) ;
      this.res.end(" Illegal Url Calls \n");
    }
  });
});

server.listen(1081);