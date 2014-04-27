var Pool = require("poolee")
var http = require("http")
var events = require("events");
var channel = new events.EventEmitter();

var _Pool_Res = ' '

var servers =
  ["localhost:1080"
  ,"localhost:1081"
  ]

//var postData = '{"name":"Danny Coates"}'

var pool = new Pool(http, servers)


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


var req_obj  = { method: "GET"
                , path: "/team/info"
              }



var s2 = http.createServer(function(q,s){
        pool.request(req_obj,req_res )//, postData incase of POST module we can send data
        
        channel.on('response', function (data) {
          s.end(data)  
        })        
});
s2.listen(8590);