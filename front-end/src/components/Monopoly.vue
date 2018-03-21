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
  let gpDiv = $('<div id="' + gp.uuid + '" class="game-piece game-piece-' + gp.type + '" class="game-piece"></div>').draggable({ 
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

  console.log(["drawGamePiece:", x, y, left, top, gp.col, gp.row, `${x}px`, `${y}px`, `#${gp.uuid}`, $(`#${gp.uuid}`)])

  // $(`#${gp.uuid}`).animate({ top: `${y}px`, left: `${x}px`}, 400, 'swing', ()=>{
  //   $(`#${gp.uuid}`).css({top: y, left: x, position:'absolute'});
  // });
  $(`#${gp.uuid}`).css({top: y, left: x, position:'absolute'});
  
};

export default {
  name: 'Monopoly',
  data () {
    return {
      msg: "Let's play Monopoly!", 
      gameBoard: null, 
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
      //console.log(["data:", data])

      if (_.has(data, "board")) {
        this.renderGameBoard(data.userId, data.board, data.index);
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
    scrubGamePieces: function(ridx, cidx, cb){
      let gpCollection = this.gameBoard[ridx][cidx];
      gpCollection.forEach(gp => $(`#${gp.uuid}`).remove());
      this.gameBoard[ridx][cidx] = [];
      cb();
    }, 
    renderGameBoard: function(userId, board, index){
      this.gameBoard = JSON.parse(JSON.stringify(board));

      let keys = Object.keys(index);
      // console.log(["board, index:", board, index, keys, this.index])
      keys.forEach ( gpid => { 
        // console.log(["this.index, gpid:", _.has(this.index, gpid), this.userId, userId, this.userId !== userId, (!_.has(this.index, gpid) || this.userId !== userId)]);
        let gp = index[gpid];
        if (!_.has(this.index, gpid) || this.userId !== userId) {
          console.log(['move initiated from server']);
          $(`#${gpid}`).remove();
          this.drawGamePieces([gp]);
          this.index[gpid] = gp;
        }
      });
    }, 
    xrenderGameBoard: function(board){
      let isInitLoaded = false;
      if (_.isNil(this.gameBoard)) {
        this.gameBoard = JSON.parse(JSON.stringify(board));
        isInitLoaded = true;
      }

      board.forEach((row, ridx) => {
        row.forEach((col, cidx) => {
          if (isInitLoaded || this.isDiff(col, this.gameBoard[ridx][cidx])) {
            this.scrubGamePieces(ridx, cidx, () => {
              this.gameBoard[ridx][cidx] = JSON.parse(JSON.stringify(col));
              this.drawGamePieces(this.gameBoard[ridx][cidx]);
            });
          }
        });
      });
    }
  }, 
  mounted() {
    window.Socket = this.$socket;

    // $( ".game-piece" ).draggable({ 
    //   containment: "#game-board", 
    //   scroll: false, 
    //   opacity: 0.7,
    //   stack: '#game-board div', 
    //   grid: [ 20, 20 ], 
    //   start: function( event, ui ) {
    //     // const gp = ui.helper[0];
    //     // self.onPickupStart (ui.helper, gp.offsetLeft, gp.offsetTop);
    //   }
    // });
  
    $( "#game-board" ).droppable({
      drop: function( event, ui ) {
        //console.log(["event, ui:", event, ui, ui.helper, ui.helper[0].id, $("div#game-board")])

        let top = ui.position.top; 
        let left = ui.position.left; 
        let row = Math.floor(top / 20);
        let col = Math.floor(left / 20);
        
        //console.log(["droppable", event, event.clientX, event.clientY, (event.clientX - left - event.offsetX), (event.clientY - top - event.offsetY), left, top, col, row])

        console.log(["droppable:", event, ui, event.offsetX, event.clientY, left, top, col, row, `${event.offsetX}px`, `${event.clientY}px`, ui.helper[0].id, $(ui.helper[0].id)])
        
        Socket.emit('placeGamePiece', 'xxx', {uuid: ui.helper[0].id, col, row})
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
