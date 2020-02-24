/**
 * This file defines all the routing information for this website
 * There are two <router-view>'s one in App.vue, one in Home.vue
 * We need to important all Vue components and configure a URL for each one
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
// import .vue componenets that need to be routed
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Permissions from '../components/authorization/Permissions.vue'
import Roles from '../components/authorization/Roles.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    redirect: '/welcome',
    component: Home,
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/permissions', component: Permissions },
      { path: '/roles', component: Roles }
    ]
  }
]

const router = new VueRouter({
  routes
})

// this function is called before redirecting
router.beforeEach((to, from, next) => {
  // if user goes to access login page, pass
  if (to.path === '/login') return next()
  // otherwise, we need to see if a token is available in sessionStorage
  const tokenStr = window.sessionStorage.getItem('token')
  // if there is no token, redirect to login
  if (!tokenStr) return next('/login')
  next()
})

export default router
