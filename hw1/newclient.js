var sys = require("sys"),
    net = require("net");

var client = net.createConnection(8590);
client.setEncoding("UTF8");

client.addListener("connect", function() {
  sys.puts("Client connected.");
  // close connection after 2sec
  setTimeout(function() {
    sys.puts("Sent to server: close");
    client.write("close");
  }, 2000);
});

client.addListener("data", function(data) {
  sys.puts("Response from server: " + data);
  if (data == "disconnect") client.end();
});

client.addListener("disconnect", function(data) {
  sys.puts("Disconnected from server");
});