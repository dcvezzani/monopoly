<template>
  <div class="monopoly">
    <div id="game-table">
      <div id="game-board">
      </div>
      <div class="gutter">
        <div class="player-name">
          <input @blur="setUserId" ref="userId" type="text" :class="[(userId.length > 0) ? 'user-id-set' : 'user-id-unset']" />
        </div>

        <div class="dice-bag">
          <button @click="rollDice">{{diceValues.join(', ')}}</button>
        </div>

        <div class="game-pieces">
          <div @click="addGamePiece" class="game-piece game-piece-player-token game-piece-player-token-dog "></div>
          <div @click="addGamePiece" class="game-piece game-piece-player-token game-piece-player-token-thimble "></div>
          <div @click="addGamePiece" class="game-piece game-piece-player-token game-piece-player-token-ship "></div>
          <div @click="addGamePiece" class="game-piece game-piece-player-token game-piece-player-token-shoe "></div>
          <div @click="addGamePiece" class="game-piece game-piece-hotel "></div>
          <div @click="addGamePiece" class="game-piece game-piece-house "></div>
        </div>

        <div class="deck-chance">
          <button @click="initCards">Init Decks</button>
          <button @click="shuffleCards">Shuffle Decks</button>
          <button @click="drawChanceCard">Draw Chance Card</button>
          <button @click="drawCommunityChestCard">Draw Community Chest Card</button>
        </div>

        <div class="hand-controls">
					<button @click="toggleHand">{{ (this.handVisible === true) ? 'Hide Hand' : 'Show Hand' }}</button>
        </div>
				
      </div>
      <div id="game-hand" class="moveable-panel">
				<div class="controls"><a @click="toggleHand" href="#">[ X ]</a></div>
				<div class="canvas">
					<Card v-for="(card, index) in cards" :key="index" :header="card.type" :body="card.body"></Card>
				</div>
      </div>
      <div id="game-players" class="moveable-panel">
				<div class="controls"><a @click="togglePlayers" href="#">[ X ]</a></div>
				<div class="canvas">
					<Player v-for="(player, index) in players" :key="index" :name="player.name" :avatar="player.avatar"></Player>
				</div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import d from 'dice-bag'
import Card from './Card.vue'
import Player from './Player.vue'

export default {
  name: 'Monopoly',
	components: {
		Card, 
		Player, 
	},
  data () {
    return {
      msg: "Let's play Monopoly!", 
      index: {}, 
      userId: '', 
			diceValues: ["Roll Dice"],
      cards: [], 
      players: [
				{name: 'Dave', avatar: 'iron'}, 
				{name: 'Kevin', avatar: 'car'}, 
				{name: 'Michael', avatar: 'dog'}, 
				{name: 'Matthew', avatar: 'hat'}, 
			], 
			handVisible: false, 
    }
  }, 
  sockets:{
    connect: function(){
      console.log('socket connected')
    },
    customEmit: function(val){
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
    }, 
    rollDice: function(data){
			console.log(['socket:r:rollDice', data]);
			this.diceValues = (data.values.length > 0) ? data.values : ["Roll Dice"];
    }, 
    deckCardCounts: function(data){
			console.log(['socket:r:deckCardCounts', data]);
    }, 
    initDeck: function(data){
			console.log(['socket:r:initDeck', data]);
      this.cards = [];
    }, 
    shuffleDeck: function(data){
			console.log(['socket:r:shuffleDeck', data]);
    }, 
    drawCard: function(data){
			console.log(['socket:r:drawCard', data]);
      this.cards.push (data.card[0][0]);
    }, 
    renderGameBoard: function(data){
      console.log(["data:", data])

      if (_.has(data, "index")) {
        this.renderGameBoard(data);
      }
    }, 
  },
  methods: {

    toggleHand: function(){
			if (this.handVisible === true) {
				$("#game-hand").animate({top: "0px", height: "0px"}, 600, 'easeOutCirc', () => {
					$("#game-hand").hide();
					this.handVisible = !(this.handVisible === true);
				})
			} else {
				$("#game-hand").show().animate({top: "-600px", height: "600px"}, 600, 'easeInOutBack', () => {
					this.handVisible = !(this.handVisible === true);
				});
			}
    },

    togglePlayers: function(){
			const div = '#game-players';
			const visibilityControl = 'playersVisible';

			if (this[visibilityControl] === true) {
				$(div).animate({top: "0px", height: "0px"}, 600, 'easeOutCirc', () => {
					$(div).hide();
					this[visibilityControl] = !(this[visibilityControl] === true);
				})
			} else {
				$(div).show().animate({top: "-600px", height: "600px"}, 600, 'easeInOutBack', () => {
					this[visibilityControl] = !(this[visibilityControl] === true);
				});
			}
    },
	
    initCards: function(event){
      console.log(['initCards', event]);
      Socket.emit('initDeck', 'xxx', {type: 'chance'})
    },
    shuffleCards: function(event){
      console.log(['shuffleCards', event]);
      Socket.emit('shuffleDeck', 'xxx', {type: 'chance'})
      Socket.emit('shuffleDeck', 'xxx', {type: 'communityChest'})
    },
    drawChanceCard: function(event){
      console.log(['drawChanceCard', event]);
      Socket.emit('drawCard', 'xxx', {type: 'chance'})
    },
    drawCommunityChestCard: function(event){
      console.log(['drawCommunityChestCard', event]);
      Socket.emit('drawCard', 'xxx', {type: 'communityChest'})
    },
    addGamePiece: function(event, ui) {
      // console.log(['addGamePiece:event', event]);
      let gpType = null;
      let isPlayerToken = event.target.className.match(/game-piece-(player-token-[^ ]+)/);
      let isGamePiece = event.target.className.match(/game-piece-([^ ]+)/);

      if (isPlayerToken !== null) {
        console.log(["addGamePiece:isPlayerToken:", isPlayerToken])
        Socket.emit('placeGamePiece', 'xxx', {type: isPlayerToken[1], left: 100, top: 100, rotation: 0})

      } else if (isGamePiece !== null) {
        console.log(["addGamePiece:isGamePiece:", isGamePiece])
        Socket.emit('placeGamePiece', 'xxx', {type: isGamePiece[1], left: 100, top: 100, rotation: 0})
      }
    },
		rollDice: function() {
      Socket.emit('rollDice', 'xxx')
		},
    setUserId: function(){
      // console.log(['this.$refs.userId', this.$refs.userId.value]);
      this.userId = this.$refs.userId.value;
    },
    clickButton: function(val){
      this.$socket.emit('emitMethod', val);
    }, 
    isDiff: function(collA, collB){
      let collASer = _.map(collA, (item) => {
        return `${item.uuid}:${item.type}:${item.col}:${item.top}:`;
      })
      let collBSer = _.map(collB, (item) => {
        return `${item.uuid}:${item.type}:${item.col}:${item.top}:`;
      })

      let delta = collASer.filter(item => {
        return !_.includes(collBSer, item)
      });

      return (delta.length > 0);
    }, 
    drawGamePieces: function(gpCollection){
      gpCollection.forEach((gp, idx) => {
        window.drawGamePiece(gp);
      });
    }, 
    renderGameBoard: function(data){
      let userId, index, remove = null;
      userId = data.userId;
      index = data.index;
      remove = data.remove;
      // console.log(["userId, index, remove:", userId, index, remove]);

      // TODO: routinely look for orphaned game pieces in case the original event was missed
      (remove || []).forEach(gpId => {
        // console.log(["remove:", `#${gpId}`])
        $(`#${gpId}`).remove();
      });

      let keys = Object.keys(index);
      // console.log(["index:", index, keys, this.index])
      keys.forEach ( gpid => { 
        // console.log(["this.index, gpid:", _.has(this.index, gpid), this.userId, userId, this.userId !== userId, (!_.has(this.index, gpid) || this.userId !== userId)]);
        let gp = index[gpid];
        if (!_.has(this.index, gpid) || this.userId !== userId) {
          // console.log(['move initiated from server']);
          $(`#${gpid}`).remove();
          this.drawGamePieces([gp]);
          this.index[gpid] = gp;
        }
      });
    }, 
  }, 
  mounted() {
    const self = this;

    window.Socket = this.$socket;

    $( "#game-board" ).droppable({
      drop: function( event, ui ) {
				if (_.indexOf(ui.helper[0].classList, 'game-piece') > -1) {
					dropOnGameboard(event, ui);
				} else {
					return;
				}
      }
    });

    $( ".moveable-panel" ).draggable({
			start: function( event, ui ) {
				// const gp = ui.helper[0];
				// self.onPickupStart (ui.helper, gp.offsetLeft, gp.offsetTop);
			}
		});

    $( document ).keypress(function(event) {
      let gp, left, top, rotation, type = null;
      switch(event.key) {
        case 'd':
          gp = $(".game-piece.selected")[0];
          Socket.emit('removeGamePiece', 'xxx', {uuid: gp.id});
          break;

        case 'h':
					self.toggleHand();
          break;

        case 'u':
					self.togglePlayers();
          break;

        case 'c':
          gp = $(".game-piece.selected")[0];
          ({left, top, type, rotation} = self.index[gp.id]);
          Socket.emit('placeGamePiece', 'xxx', {type, left, top, rotation});
          break;

        case 'r':
          gp = $(".game-piece.selected")[0];
          ({left, top} = self.index[gp.id]);
          rotation = (self.index[gp.id].rotation === 0) ? 90 : 0;
          // console.log(["self.index[gp.id].rotation:", self.index[gp.id].rotation, (self.index[gp.id].rotation === 0), rotation])

          Socket.emit('placeGamePiece', 'xxx', {uuid: gp.id, left, top, rotation});
          break;
      }
    });

		// window.Event.$on('asdf', () => { console.log('asdf'); });
    
    Socket.emit('initGameBoard', 'xxx')

		$("#game-hand").show().animate({top: "-600px", height: "600px"}, 600, 'easeInOutBack', () => {
			this.handVisible = !(this.handVisible === true);
		});

  }, 
}

const dropOnGameboard = (event, ui) => {
	let top = ui.position.top; 
	let left = ui.position.left; 

	console.log(["droppable:", event, ui, event.offsetX, event.clientY, left, top, `${event.offsetX}px`, `${event.clientY}px`, ui.helper, ui.helper[0].id, $(ui.helper[0].id)])
	
	Socket.emit('placeGamePiece', 'xxx', {uuid: ui.helper[0].id, left, top})
};

window.drawGamePiece = (gp) => {
  let gamePieceClass = `game-piece-${gp.type}`;
  let rotation = _.get(gp, "rotation", 0);
  let selected = _.get(gp, "selected", false);
  let remove = _.get(gp, "remove", []);
	let gamePieceClasses = [gamePieceClass];

  if (rotation > 0) {
		gamePieceClasses.push (`${gamePieceClass}-${gp.rotation}`);
  }
  if (selected === true) {
		gamePieceClasses.push (`selected`);
  }
  if (gamePieceClass.match(/player-token/) !== null) {
		gamePieceClasses.unshift (`game-piece-player-token`);
  }

  let gpDiv = $(`<div id="${gp.uuid}" class="game-piece ${gamePieceClasses.join(' ')}"></div>`).draggable({ 
    containment: "#game-board", 
    scroll: false, 
    opacity: 0.7,
    stack: '#game-board div', 
    start: function( event, ui ) {
      // const gp = ui.helper[0];
      // self.onPickupStart (ui.helper, gp.offsetLeft, gp.offsetTop);
    }
  });
  $("#game-board").append(gpDiv);

  // let top = $("div#game-board")[0].offsetTop
  // let left = parseInt($("div#game-board").css('marginLeft')); // 67; div#game-board; margin-left

  console.log(["drawGamePiece:", gp.left, gp.top, `${gp.left}px`, `${gp.top}px`, `#${gp.uuid}`, $(`#${gp.uuid}`)])

  // $(`#${gp.uuid}`).animate({ top: `${y}px`, left: `${x}px`}, 400, 'swing', ()=>{
  //   $(`#${gp.uuid}`).css({top: y, left: x, position:'absolute'});
  // });
  //$(`#${gp.uuid}`).fadeTo(300, 0.3, function() { $(this).fadeTo(500, 1.0); });

  $(`#${gp.uuid}`).css({top: gp.top, left: gp.left, position:'absolute'});
  // $(`#${gp.uuid}`).effect("pulsate", { times:3 }, 1000);
  $(`#${gp.uuid}`).removeClass("selected");
  
  $(`#${gp.uuid}`).click((event, ui) => {
    // console.log(["event, ui:", event, ui]);
    $(event.target).addClass("selected");
  });
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.game-piece {
  display: block; 
  background-color: black;
  width: 20px;
  height: 20px;
  position: relative;
  border: 2px solid black;
}

.game-piece-player {
  background-color: gray;
}
.game-piece-house {
  background-color: green;
}
.game-piece-hotel {
  background-color: red;
  width: 40px;
}
.game-piece-hotel-90 {
  width: 20px;
  height: 40px;
}


.xgame-piece-hotel-90 .selected {
  width: 30px;
  height: 50px;
  position: relative;
  left: -5px;
  top: -5px;
}
.xselected {
  box-shadow: 0 0px 36px 0 rgba(239,211,105, 1), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
.game-piece.selected {
  border: 3px solid rgba(239,211,105, 1);
}

.monopoly-player-piece {
	display: block;
	width: 40px;
	height: 40px;
}

.game-piece-player-token {
    width: 40px;
    height: 40px;
    background-image: url("../assets/monopoly-player-pieces.png");
    background-size: auto 49px;
    background-repeat: no-repeat;
    background-color: transparent;
    border: 0;
}

.game-piece-player-token-iron {
    background-position: -5px -4px;
}

.game-piece-player-token-shoe {
    background-position: -45px -4px;
}

.game-piece-player-token-ship {
    background-position: -88px -4px;
}

.game-piece-player-token-hat {
    background-position: -128px -4px;
}

.game-piece-player-token-dog {
    background-position: -168px -4px;
}

.game-piece-player-token-car {
    background-position: -208px -4px;
}

.game-piece-player-token-thimble {
    background-position: -248px -4px;
}

.game-piece-player-token-wheel-barrow {
    background-position: -288px -4px;
}

.monopoly-player-piece-iron {
	background-image: url("../assets/monopoly-player-pieces.png");
}
</style>

<style scoped>
#game-table {
    width: 1000px;
    margin: 0 auto;
}
div.gutter {
    width: 190px;
    height: 800px;
    display: inline-block;
    float: right;
		position: relative;
}

div.gutter .hand-controls {
	position: relative;
	bottom: 0px;
}

#game-board {
    border: 1px solid blue;
    display: inline-block;
    background-image: url("../assets/Monopoly-Board.jpg");
    width: 800px;
    height: 800px;
    background-size: 800px;
    background-repeat: no-repeat;
    position: relative;
    float: left;
}

div.moveable-panel {
	clear: both; 
	width: 100%;
	height: auto;
	/* border: 3px solid black; */
  box-shadow: 0 -8px 12px 0 rgba(0,0,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12);
	background-color: #efefef;
	width: 100%;
	height: 0px;
	position: relative;
	border-radius: 10px 10px 0 0;
	display: none;
}

div.moveable-panel .controls {
	float: right; 
}

div.moveable-panel .canvas {
	position: relative;
	overflow: scroll;
	height: 600px;
}

div.game-pieces div{
  display: inline-block;
}

h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.user-id-set { 
  background-color: red;
}
</style>
