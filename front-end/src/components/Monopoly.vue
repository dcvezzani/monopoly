<template>
  <div class="monopoly">
    <input @blur="setUserId" ref="userId" type="text" :class="[(userId.length > 0) ? 'user-id-set' : 'user-id-unset']" />
    <button @click="rollDice">{{diceValues.join(', ')}}</button>
    <div id="game-board">
    </div>
  </div>
</template>

<script>
const _ = require('lodash');
const d = require('dice-bag');

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

export default {
  name: 'Monopoly',
  data () {
    return {
      msg: "Let's play Monopoly!", 
      index: {}, 
      userId: '', 
			diceValues: ["Roll Dice"],
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
    renderGameBoard: function(data){
      console.log(["data:", data])

      if (_.has(data, "index")) {
        this.renderGameBoard(data);
      }
    }, 
  },
  methods: {
		rollDice: function() {
      Socket.emit('rollDice', 'xxx')

			// let speedDie = d(1,6);

			// switch(speedDie) {
			// 	case 4:
			// 	case 5:
			// 		speedDie = "Mr. Monopoly"
			// 		break;
			// 	case 6:
			// 		speedDie = "Bus"
			// 		break;
			// }
			// this.diceValues = [d(1,6), d(1,6), speedDie];
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
        let top = ui.position.top; 
        let left = ui.position.left; 

        console.log(["droppable:", event, ui, event.offsetX, event.clientY, left, top, `${event.offsetX}px`, `${event.clientY}px`, ui.helper[0].id, $(ui.helper[0].id)])
        
        Socket.emit('placeGamePiece', 'xxx', {uuid: ui.helper[0].id, left, top})
      }
    });

    $( document ).keypress(function(event) {
      let gp, left, top, rotation, type = null;
      switch(event.key) {
        case 'd':
          gp = $(".game-piece.selected")[0];
          Socket.emit('removeGamePiece', 'xxx', {uuid: gp.id});
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
    
    Socket.emit('initGameBoard', 'xxx')

  }, 
}
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
.selected {
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
#game-board {
    background-image: url("../assets/Monopoly-Board.jpg");
    display: block;
    width: 800px;
    height: 800px;
    background-size: 800px;
    background-repeat: no-repeat;
    position: relative;
    margin: 0 auto;
    border: 1px solid blue;
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
