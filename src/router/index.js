import Vue from 'vue'
import VueRouter from 'vue-router'
// import .vue componenets that need to be routed
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    redirect: '/welcome',
    component: Home,
    children: [{ path: '/welcome', component: Welcome }]
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
