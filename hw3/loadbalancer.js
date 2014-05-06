var Pool = require("poolee")
var http = require("http")
var events = require("events");
var channel = new events.EventEmitter();


var _Pool_Res = ' '
var req_counter = 0; // Maintains the number of requests 

var servers =
  ["localhost:1080"
  ,"localhost:1081"
  ,"localhost:1082"
  ,"localhost:1083"
  ]

//var postData = '{"name":"Danny Coates"}'

var pool = new Pool(http, servers
          ,{
            maxPending: 1000       // maximum number of outstanding request to allow
          , maxSockets: 20        // max sockets per endpoint Agent
          , timeout: 60000         // request timeout in ms
          , resolution: 1000       // timeout check interval (see below)
          , ping: "/ping"       // health check url
          , pingTimeout: 2000      // ping timeout in ms
          }
  )


var req_res = function (error, response, body) {
    if (error) {
      console.error(error.message)
      return
    }
    if(response.statusCode === 201) {
      console.log("put succeeded")
    }
    if(response.statusCode === 200){
      req_counter++;
      console.log(response.statusCode)
      channel.emit('response',body);
    }
    else {
      console.log(response.statusCode)
      channel.emit('response',body);
    }
  }


var server = http.createServer(function(q,s){
        console.log(" The loadbalancer is listening in 8590")
        var req_obj  = { method: "GET"
                , path: q.url
              }
        console.log("query" , q.url)
        pool.request(req_obj,req_res )//, postData incase of POST module we can send data
        channel.on('response', function (data) {
          s.end(data)  
        })        
});



function raffle_winner() {
  console.log("The Raffle Awards Goes too....................................")
  if (req_counter <= 100)  {
    console.log("Prize 1: Goes to Request",req_counter);
    console.log("No Prize 2 yet. Since request count is lesser than 100");
  }

  else if(req_counter <= 200 && req_counter > 100) {
    console.log("Prize 1: Goes to Request 100");
    console.log("Prize 2: Goes to Request",req_counter);
  }

  else {
    var max = Math.floor(req_counter / 10) ;
    var random = Math.floor(Math.random() * (max - 0) + 0) ;
    console.log("Prize 1: Goes to Request ",random * 10);
    random = Math.floor(Math.random() * (max - 0) + 0) ;
    console.log("Prize 2: Goes to Request ",random * 10);
  }
  console.log("total no of request combined" , req_counter);
  console.log("---------------------------------------------------------------")
}



process.on('SIGINT', function() {
    console.log(" \n Caught interrupt signal. Cleaning up all the connections .. Goodbye   \n");
    raffle_winner();
    console.log("                         ---------- __o");
    console.log("                       --------  _ \<,_");
    console.log("                     -------    (*)/ (*)");
    server.close();
    process.exit();
});









server.listen(8590);