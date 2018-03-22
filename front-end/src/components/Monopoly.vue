<template>
  <div class="monopoly">
    <input @blur="setUserId" ref="userId" type="text" :class="[(userId.length > 0) ? 'user-id-set' : 'user-id-unset']" />
    <div id="game-board">
    </div>
  </div>
</template>

<script>
const _ = require('lodash');

window.drawGamePiece = (gp) => {
  let gamePieceClass = `game-piece-${gp.type}`;
  let rotation = _.get(gp, "rotation", 0);
  let selected = _.get(gp, "selected", false);
  let remove = _.get(gp, "remove", []);

  if (rotation > 0) {
    gamePieceClass = `${gamePieceClass} ${gamePieceClass}-${gp.rotation}`;
  }
  if (selected === true) {
    gamePieceClass = `${gamePieceClass} selected`;
  }

  // let gpDiv = $(`<div id="${gp.uuid}" class="game-piece ${gamePieceClass}" class="game-piece"><div class="selected"></div></div>`).draggable({ 
  let gpDiv = $(`<div id="${gp.uuid}" class="game-piece ${gamePieceClass}" class="game-piece"></div>`).draggable({ 
    containment: "#game-board", 
    scroll: false, 
    opacity: 0.7,
    stack: '#game-board div', 
    grid: [ 20, 20 ], 
    start: function( event, ui ) {
      // const gp = ui.helper[0];
      // self.onPickupStart (ui.helper, gp.offsetLeft, gp.offsetTop);
    }
  });
  $("#game-board").append(gpDiv);

  let top = $("div#game-board")[0].offsetTop
  let left = parseInt($("div#game-board").css('marginLeft')); // 67; div#game-board; margin-left

  let x = (gp.col * 20);
  let y = (gp.row * 20);

  // console.log(["drawGamePiece:", x, y, left, top, gp.col, gp.row, `${x}px`, `${y}px`, `#${gp.uuid}`, $(`#${gp.uuid}`)])

  // $(`#${gp.uuid}`).animate({ top: `${y}px`, left: `${x}px`}, 400, 'swing', ()=>{
  //   $(`#${gp.uuid}`).css({top: y, left: x, position:'absolute'});
  // });
  $(`#${gp.uuid}`).css({top: y, left: x, position:'absolute'});
  //$(`#${gp.uuid}`).fadeTo(300, 0.3, function() { $(this).fadeTo(500, 1.0); });
  $(`#${gp.uuid}`).effect("pulsate", { times:3 }, 1000);
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
    }
  }, 
  sockets:{
    connect: function(){
      console.log('socket connected')
    },
    customEmit: function(val){
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
    }, 
    renderGameBoard: function(data){
      console.log(["data:", data])

      if (_.has(data, "index")) {
        this.renderGameBoard(data);
      }
    }, 
  },
  methods: {
    setUserId: function(){
      // console.log(['this.$refs.userId', this.$refs.userId.value]);
      this.userId = this.$refs.userId.value;
    },
    clickButton: function(val){
      this.$socket.emit('emitMethod', val);
    }, 
    isDiff: function(collA, collB){
      let collASer = _.map(collA, (item) => {
        return `${item.uuid}:${item.type}:${item.col}:${item.row}:`;
      })
      let collBSer = _.map(collB, (item) => {
        return `${item.uuid}:${item.type}:${item.col}:${item.row}:`;
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
        let row = Math.floor(top / 20);
        let col = Math.floor(left / 20);

        // console.log(["droppable:", event, ui, event.offsetX, event.clientY, left, top, col, row, `${event.offsetX}px`, `${event.clientY}px`, ui.helper[0].id, $(ui.helper[0].id)])
        
        Socket.emit('placeGamePiece', 'xxx', {uuid: ui.helper[0].id, col, row})
      }
    });

    $( document ).keypress(function(event) {
      let gp, col, row, rotation, type = null;
      switch(event.key) {
        case 'd':
          gp = $(".game-piece.selected")[0];
          Socket.emit('removeGamePiece', 'xxx', {uuid: gp.id});
          break;

        case 'c':
          gp = $(".game-piece.selected")[0];
          ({col, row, type, rotation} = self.index[gp.id]);
          Socket.emit('placeGamePiece', 'xxx', {type, col, row, rotation});
          break;

        case 'r':
          gp = $(".game-piece.selected")[0];
          ({col, row} = self.index[gp.id]);
          rotation = (self.index[gp.id].rotation === 0) ? 90 : 0;
          // console.log(["self.index[gp.id].rotation:", self.index[gp.id].rotation, (self.index[gp.id].rotation === 0), rotation])

          Socket.emit('placeGamePiece', 'xxx', {uuid: gp.id, col, row, rotation});
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
}

.game-piece-player {
  background-color: gray;
}
.game-piece-house {
  background-color: green;
}
.game-piece-hotel {
  border: 2px solid black;
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
