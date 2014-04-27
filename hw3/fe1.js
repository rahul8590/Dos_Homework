/* If you already have a server running and just want to use the balancer then you don't need the code below, just set the listenport above to be whatever port your server is running on */
var http = require("http");
var s2 = http.createServer(function(q,s){
  s.end("served from port 1080, server 1");
});
s2.listen(1080);