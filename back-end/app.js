const http = require('http');
const logger = require('morgan');
const _ = require('lodash');
const uuidV1 = require('uuid/v1');

var game = {
  index: {}, 
}

var initGameBoard = (cb) => {
  cb(game.index);
}

var placeGamePiece = (options={type: 'player', rotation: 0, left: 100, top: 100}, cb) => {
  let gp = null;
  let uuid = null;
  let isNew = false;
  let type = _.get(options, "type", "player");
  let rotation = _.get(options, "rotation", 0);
  console.log(["options:", options])

  if (_.has(options, "uuid")) {
    uuid = options.uuid;
    rotation = _.get(options, "rotation", game.index[uuid].rotation);
    gp = {...(game.index[uuid]), left: options.left, top: options.top, rotation: rotation};
    type = gp.type;

    removeGamePiece({uuid});

  } else {
    uuid = uuidV1(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a' 
    isNew = true;

    switch(options.type) {
      case 'player':
      case 'house':
        gp = {...options, uuid, isNew};
        break;
      case 'hotel':
        gp = {...options, type: 'hotel', uuid, isNew};
        break;
    }
  }
  
  game.index[uuid] = gp;

  if (!_.isNil(cb)) {
    cb(game.index);
  }
}

var removeGamePiece = (options={uuid: null}, cb) => {
  let gp = game.index[options.uuid];
  if (!_.isNil(gp)) {
    delete game.index[options.uuid];
  }

  if (!_.isNil(cb)) {
    cb(game.index, gp);
  }
}

var server = require('http').createServer();
var io  = require('socket.io')(server, { path: '/monopoly/socket.io'}).listen(8085);
// var io = require('socket.io').listen(8085);

// var io = require('socket.io')(server);
// server.listen(process.env.PORT || 3000);


// io
// .of('/my-namespace')
// .on('connection', function(socket){
//     console.log('a user connected with id %s', socket.id);
// 
//     socket.on('my-message', function (data) {
//         io.of('my-namespace').emit('my-message', data);
//         // or socket.emit(...)
//         console.log('broadcasting my-message', data);
//     });
// });

//turn off debug
// io.set('log level', 1);

io
.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('connect');

  socket.on('emitMethod', function(val){
    socket.emit('customEmit', val);
  });

  socket.on('initGameBoard', function(userId){
    initGameBoard((index) => {
      console.log(["game.index:", game.index])
      io.emit('renderGameBoard', {userId, index: game.index});
    })
  });
  socket.on('placeGamePiece', function(userId, gp){
    placeGamePiece(gp, (index) => {
      console.log(["game.index:", game.index])
      io.emit('renderGameBoard', {userId, index: game.index});
    })
  });
  socket.on('removeGamePiece', function(userId, gp){
    removeGamePiece(gp, (index, gp) => {
      console.log(["game.index:", game.index])
      io.emit('renderGameBoard', {userId, index: game.index, remove: [gp.uuid]});
    })
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

