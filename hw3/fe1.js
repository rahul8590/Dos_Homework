var http = require('http'),
    director = require('director'),
    cache = require('memory-cache'),
    events = require("events"),
    redis = require('redis'),
    stdio = require('stdio');

var ops = stdio.getopt({
  'port' : {key: 'port', args: 1, description: 'Port in which server needs to run'}
});



var router = new director.http.Router();
var channel = new events.EventEmitter();
var rclient = redis.createClient(),
    sclient = redis.createClient();


// Ping url for loadbalancer to check if alive or not
router.get("/ping",function main(){
  this.res.end("I am alive")
});


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


// Subscribing to notif channel which recives notifications on updates

sclient.subscribe("notif");
sclient.on("message",function (channel,count){
  //Refresh the cache values. 
  console.log("the channel values are ",channel)
   var keys = ['curling','skiing','rome','gual']
   for (var i = 0 ; i< keys.length ; i++) {
      rclient.hgetall(keys[i],function(err,obj){  
        cache.put(keys[i],obj);
      }); 
   }
   console.log("Updating cache values based on Cacophonix Notifications");
});


//Purgin Caches Every 5 secs 
setInterval(function () {
  console.log("Cache Refresh Happening Every 10 Seconds");
  cache.clear();
},10000);


var server = http.createServer(function (req, res) { 
  router.dispatch(req,res,function(err) {   
    if(err) {
      console.log(" Unwarrented Url ") ;
      this.res.end(" Illegal Url Calls \n");
    }
  });
});

server.listen(ops.port);