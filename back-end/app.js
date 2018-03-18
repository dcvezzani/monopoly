var logger = require('morgan');

var io = require('socket.io').listen(8085);

//turn off debug
// io.set('log level', 1);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('connect');

  socket.on('emitMethod', function(val){
    socket.emit('customEmit', val);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// io.sockets.on('connection', function(socket){
//   //send data to client
//   setInterval(function(){
//     socket.emit('stream', {'title': "A new title via Socket.IO!"});
//   }, 1000);
// });

