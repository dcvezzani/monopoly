import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Monopoly from '@/components/Monopoly'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Monopoly',
      component: Monopoly
    }, 
    {
      path: '/hello',
      name: 'HelloWorld',
      component: HelloWorld
    }, 
  ]
})
