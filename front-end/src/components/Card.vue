<template>
  <div @click="selectCard" :class="['card', (selected === true) ? 'selected' : '']">
		<div class="header">{{ header }}</div>
		<div class="body">{{ body }}</div>
		<div class="footer">{{ footer }}</div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'Card',
  props: ['header', 'body', 'footer', 'type'],
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
    selectCard: function(){
			this.timestamp = moment().format('YYYYMMDDHHmmSSSS');
			console.log(`[M] select-card: ${this.timestamp}`);
			window.Event.$emit('deselect-card', {timestamp: this.timestamp});
			this.selected = !(this.selected === true);
    }
  }, 
  mounted() {
		window.Event.$on('deselect-card', ({timestamp}) => { 
			if (this.timestamp !== timestamp) {
				console.log(`[E] deselect-card: ${timestamp} <> ${this.timestamp}`);
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

.card {
	position: relative;
	width: 200px;
	height: 250px;
	margin: 1em;
	top: 1em;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12);
	background-color: white;
	display: inline-block; 
}

/* .card:not(:last-child) { */
.xcard:last-child {
	background-color: red;
}

.card .body {
	height: 125px;
	overflow: scroll;
	margin: 0 1em;
}
.card .header, 
.card .footer {
	border: 1px solid black;
	margin: 1em;
	padding: 2px;
	background-color: rgba(0,0,0,0.16); 
}
.card .footer {
	font-size: smaller;
	margin-top: 2em;
	display: none; 
}

.card.selected {
  /* box-shadow: 0 2px 12px 0 rgba(0,255,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12); */
	box-shadow: 28px 12px 69px 0 rgba(0,255,0,0.16), 15px 12px 10px 0 rgba(0,0,0,0.12);
}

</style>
