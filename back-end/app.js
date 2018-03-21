const logger = require('morgan');
const _ = require('lodash');
const uuidV1 = require('uuid/v1');

var createArray = (cnt) => {
  return _.map(_.range(cnt), () => { return [] });
}

var game = {board: 
  _.map(_.range(40), () => { return createArray(40) }), 
  index: {}, 
}

var initGameBoard = (cb) => {
  // console.log(["initGameBoard", JSON.stringify(game.board)])
  cb(game.board);
}

var placeGamePiece = (options={type: 'player', col: 10, row: 10}, cb) => {
  let gp = null;
  let uuid = null;
  let isNew = false;
  let type = _.get(options, "type", "player");

  if (_.has(options, "uuid")) {
    uuid = options.uuid;
    gp = {...(game.index[uuid]), col: options.col, row: options.row};
    type = gp.type;

    removeGamePiece({uuid});

  } else {
    uuid = uuidV1(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a' 
    isNew = true;

    switch(options.type) {
      case 'player':
        gp = {...options, type: 'player', uuid, isNew};
        break;
    }
  }
  
  game.board[options.row][options.col].push (gp);
  game.index[uuid] = gp;

  if (!_.isNil(cb)) {
    cb(game.board);
  }
}

var removeGamePiece = (options={uuid: null}, cb) => {
  let gp = game.index[options.uuid];
  if (!_.isNil(gp)) {
    let gpCollection = game.board[gp.row][gp.col].filter(item => item.uuid != options.uuid);
    game.board[gp.row][gp.col] = gpCollection;
    delete game.index[options.uuid];
  }

  if (!_.isNil(cb)) {
    cb(game.board);
  }
}

var io = require('socket.io').listen(8085);

//turn off debug
// io.set('log level', 1);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('connect');

  socket.on('emitMethod', function(val){
    socket.emit('customEmit', val);
  });

  socket.on('initGameBoard', function(userId){
    initGameBoard((board) => {
      console.log(["game.index:", game.index])
      io.emit('renderGameBoard', {userId, board, index: game.index});
    })
  });
  socket.on('placeGamePiece', function(userId, gp){
    placeGamePiece(gp, (board) => {
      console.log(["game.index:", game.index])
      io.emit('renderGameBoard', {userId, board, index: game.index});
    })
  });
  socket.on('removeGamePiece', function(userId, gp){
    removeGamePiece(gp, (board) => {
      console.log(["game.index:", game.index])
      io.emit('renderGameBoard', {userId, board, index: game.index});
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

