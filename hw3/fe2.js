var http = require('http'),
    director = require('director'),
    cache = require('memory-cache'),
    events = require("events"),
    redis = require('redis');


var router = new director.http.Router();
var channel = new events.EventEmitter();
var rclient = redis.createClient();



/*Creating Router Routes (dispatch)
/getinfo/rome
/getinfo/gual
*/
router.get('/getinfo/:teamname', function main(teamname) {
  var reply = this;
  var result = cache.get(teamname)
  console.log("requested eventname is ", teamname)
  if (result == undefined){
    rclient.hgetall(teamname,function(err,obj){
        console.log("the response from redis is ",obj)
        console.log("inserting to cache");  
        cache.put(teamname,obj);
        reply.res.end(JSON.stringify(obj));
    });
  }
  else {
    console.log("getting value from cache");
    this.res.end(JSON.stringify(result));
  }  
});


/*Creating Router Routes (dispatch)
/getscore/curling
/getscore/skiing
*/

router.get('/getscore/:eventname', function main(eventname) {
  
  var reply = this; 
  console.log("requested eventname is ", eventname)
  var result = cache.get(eventname)
  if (result == undefined){
    rclient.hgetall(eventname,function(err,obj){
        console.log("the response from redis is ",obj)
        console.log("inserting to cache");  
        cache.put(eventname,obj);
        reply.res.end(JSON.stringify(obj));
    });
  }
  else {
    console.log("getting value from cache");
    this.res.end(JSON.stringify(result));
  }
  
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