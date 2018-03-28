const http = require('http');
const logger = require('morgan');
const _ = require('lodash');
const uuidV1 = require('uuid/v1');
const diceBag = require('dice-bag')
const Deck = require('./deck')

const chanceCards = [
  {type: 'chance', body: 'Advance to Go (Collect $200)'}, 
  {type: 'chance', body: 'Advance to Illinois Ave—If you pass Go, collect $200'}, 
  {type: 'chance', body: 'Advance to St. Charles Place – If you pass Go, collect $200'}, 
  {type: 'chance', body: 'Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.'}, 
  {type: 'chance', body: 'Advance token to the nearest Railroad and pay owner twice the rental to which he/she {he} is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.'}, 
  {type: 'chance', body: 'Bank pays you dividend of $50'}, 
  {type: 'chance', body: 'Get Out of Jail Free'}, 
  {type: 'chance', body: 'Go Back 3 Spaces'}, 
  {type: 'chance', body: 'Go to Jail–Go directly to Jail–Do not pass Go, do not collect $200'}, 
  {type: 'chance', body: 'Make general repairs on all your property–For each house pay $25–For each hotel $100'}, 
  {type: 'chance', body: 'Pay poor tax of $15'}, 
  {type: 'chance', body: 'Take a trip to Reading Railroad–If you pass Go, collect $200'}, 
  {type: 'chance', body: 'Take a walk on the Boardwalk–Advance token to Boardwalk'}, 
  {type: 'chance', body: 'You have been elected Chairman of the Board–Pay each player $50'}, 
  {type: 'chance', body: 'Your building and loan matures—Collect $150'}, 
  {type: 'chance', body: 'You have won a crossword competition—Collect $100'}, 
];

const communityChestCards = [
  {type: 'community chest', body: 'Advance to Go (Collect $200)'},
  {type: 'community chest', body: 'Bank error in your favor—Collect $200'},
  {type: 'community chest', body: "Doctor's fee—Pay $50"},
  {type: 'community chest', body: 'From sale of stock you get $50'},
  {type: 'community chest', body: 'Get Out of Jail Free'},
  {type: 'community chest', body: 'Go to Jail–Go directly to jail–Do not pass Go–Do not collect $200'},
  {type: 'community chest', body: 'Grand Opera Night—Collect $50 from every player for opening night seats'},
  {type: 'community chest', body: 'Holiday Fund matures—Receive $100'},
  {type: 'community chest', body: 'Income tax refund–Collect $20'},
  {type: 'community chest', body: 'It is your birthday—Collect $10'},
  {type: 'community chest', body: 'Life insurance matures–Collect $100'},
  {type: 'community chest', body: 'Pay hospital fees of $100'},
  {type: 'community chest', body: 'Pay school fees of $150'},
  {type: 'community chest', body: 'Receive $25 consultancy fee'},
  {type: 'community chest', body: 'You are assessed for street repairs–$40 per house–$115 per hotel'},
  {type: 'community chest', body: 'You have won second prize in a beauty contest–Collect $10'},
  {type: 'community chest', body: 'You inherit $100'},
];

let game = {
  index: {}, 
	diceValues: [],
	cardDecks: [],
}

let initGameBoard = (cb) => {
  initDecks();
  cb(game.index);
}

let placeGamePiece = (options={type: 'player', rotation: 0, left: 100, top: 100}, cb) => {
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
			default: 
        gp = {...options, uuid, isNew};
        break;
    }
  }
  
  game.index[uuid] = gp;

  if (!_.isNil(cb)) {
    cb(game.index);
  }
}

let removeGamePiece = (options={uuid: null}, cb) => {
  let gp = game.index[options.uuid];
  if (!_.isNil(gp)) {
    delete game.index[options.uuid];
  }

  if (!_.isNil(cb)) {
    cb(game.index, gp);
  }
}

let rollDice = (cb) => {
	let speedDie = diceBag(1,6);

	switch(speedDie) {
		case 4:
		case 5:
			speedDie = "Mr. Monopoly"
			break;
		case 6:
			speedDie = "Bus"
			break;
	}
	game.diceValues = [diceBag(1,6), diceBag(1,6), speedDie];

  if (!_.isNil(cb)) {
    cb(game.diceValues);
  }
}

let initDecks = (cb) => {
  let chance = new Deck(chanceCards);
  let communityChest = new Deck(communityChestCards);
  game.cardDecks = {chance, communityChest};
  // console.log(["game.cardDecks:", game.cardDecks])

  if (!_.isNil(cb)) {
    cb(game.cardDecks);
  }
}

let shuffleDeck = (type) => {

}

let cardCounts = (decks) => {
  return _.map(decks, deck => { 
    // console.log(["deck:", JSON.stringify(deck), deck.deck[0]])
    let type = deck.deck[0].type;
    let count = deck.deck.length;
    // console.log(["{type, count}:", {type, count}])
    return {type, count};
  })
}



let server = require('http').createServer();
let io  = require('socket.io')(server, { path: '/monopoly/socket.io'}).listen(8085);
// let io = require('socket.io').listen(8085);

io.origins((origin, callback) => {
  // if (origin !== 'https://foo.example.com') {
  //   return callback('origin not allowed', false);
  // }
  console.log(['origins, cors', origin])
  callback(null, true);
});

// let io = require('socket.io')(server);
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
      initDecks((decks) => {
        console.log(["game.index, decks:", game.index, cardCounts(game.cardDecks)])
        io.emit('renderGameBoard', {userId, index: game.index});
        io.emit('rollDice', {userId, values: game.diceValues});
        io.emit('deckCardCounts', {userId, values: cardCounts(game.cardDecks)});
      })
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
  socket.on('rollDice', function(userId){
    rollDice((values) => {
      console.log(["rollDice:", userId, game.diceValues])
      io.emit('rollDice', {userId, values: game.diceValues});
    })
  });
  socket.on('shuffleDeck', function(userId, deckType){
    shuffleDeck(() => {
      console.log(["shuffleDeck:", userId, deckType])
      io.emit('shuffleDeck', {userId, deckType});
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

