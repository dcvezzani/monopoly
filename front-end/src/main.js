// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import io from 'socket.io-client';

window.jQuery = require('jquery');
window.$ = window.jQuery;
window.$ = $.extend(require('jquery-ui-dist/jquery-ui.js'))

// yarn add node-sass sass-loader
import './assets/sass/main.scss'

import VueSocketio from 'vue-socket.io';
// Vue.use(VueSocketio, 'http://games.reliacode.com:8085');
Vue.use(VueSocketio, io('http://games.reliacode.com:8085', { path: '/monopoly/socket.io'}));

Vue.config.productionTip = false

window.Event = new Vue();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
