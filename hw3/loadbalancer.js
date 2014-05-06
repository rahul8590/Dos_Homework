var Pool = require("poolee")
var http = require("http")
var events = require("events");
var channel = new events.EventEmitter();

var _Pool_Res = ' '

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
    else {
      console.log(response.statusCode)
      channel.emit('response',body);
    }
  }


var s2 = http.createServer(function(q,s){
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
s2.listen(8590);