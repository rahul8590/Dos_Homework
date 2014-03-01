  var io = require('socket.io-client'),
socket = io.connect('localhost', {
    port: 8000
});

socket.on('news', function (data) {
        console.log(data);
        //socket.emit('my other event', { my: 'data' });
});
