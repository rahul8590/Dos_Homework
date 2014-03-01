var io = require('socket.io').listen(8000,{ log: false });

io.sockets.on('connection', function (socket) {
    
    setInterval(function () {
    	socket.emit('news', { hello: 'world' });
    },2000);
    /*socket.on('my other event', function (data) {
            console.log(data);
              });*/
});
