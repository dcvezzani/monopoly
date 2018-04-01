<template>
  <div @click="selectPlayer" :class="['player', (selected === true) ? 'selected' : '', ]">
		<div class="header">{{ name }}</div>
		<div :class="['avatar', `avatar-${avatar}`]"></div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'Player',
  props: ['name', 'avatar'],
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
			// header: 'Chance',
			// body: 'Lorem inventore consectetur ipsa est cum nisi dicta officiis Deleniti vero reiciendis temporibus nesciunt asperiores Sunt necessitatibus quibusdam quidem ex fuga omnis. Quis aliquam sit quisquam quos placeat quasi tenetur.',
			// footer: '2, 3',
			selected: false, 
			timestamp: null, 
    }
  }, 
  methods: {
    selectPlayer: function(){
			this.timestamp = moment().format('YYYYMMDDHHmmSSSS');
			console.log(`[M] select-player: ${this.timestamp}`);
			window.Event.$emit('deselect-player', {timestamp: this.timestamp});
			this.selected = !(this.selected === true);
    }
  }, 
  mounted() {
		window.Event.$on('deselect-player', ({timestamp}) => { 
			if (this.timestamp !== timestamp) {
				console.log(`[E] deselect-player: ${timestamp} <> ${this.timestamp}`);
				this.selected = false;
			}
		});
  }, 
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

.player {
	position: relative;
	width: 200px;
	height: 250px;
	margin: 1em;
	top: 1em;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12);
	background-color: white;
	display: inline-block; 
}

/* .player:not(:last-child) { */
.xplayer:last-child {
	background-color: red;
}

.player .avatar, 
.player .avatar.avatar-iron {
	height: 125px;
	margin: 0 17px;
	width: 165px;
	height: 165px;
	background-image: url(/monopoly/static/img/monopoly-player-pieces.ed72fad.png);
	background-size: auto 205px;
	background-repeat: no-repeat;
	background-color: transparent;
	border: 1px solid orange;
	border: 0; 
	background-position: -20px -19px;	
}

.player .avatar.avatar-shoe {
	background-position: -191px -19px; /* 171 */
}
.player .avatar.avatar-ship {
	background-position: -362px -19px;
}
.player .avatar.avatar-hat {
	background-position: -531px -19px;
}
.player .avatar.avatar-dog {
	background-position: -700px -19px;
}
.player .avatar.avatar-car {
	background-position: -872px -19px;
}
.player .avatar.avatar-thimble {
	background-position: -1041px -19px;
}
.player .avatar.avatar-wheel-barrow {
	background-position: -1212px -19px;
}

.player .header, 
.player .footer {
	border: 1px solid black;
	margin: 1em;
	padding: 2px;
	background-color: rgba(0,0,0,0.16); 
}
.player .footer {
	font-size: smaller;
	margin-top: 2em;
	display: none; 
}

.player.selected {
  /* box-shadow: 0 2px 12px 0 rgba(0,255,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12); */
	box-shadow: 28px 12px 69px 0 rgba(0,255,0,0.16), 15px 12px 10px 0 rgba(0,0,0,0.12);
}

</style>
