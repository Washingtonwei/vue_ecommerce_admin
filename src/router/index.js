/**
 * This file defines all the routing information for this website
 * There are two <router-view>'s one in App.vue, one in Home.vue
 * We need to important all Vue components and configure a URL for each one
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
// import .vue componenets that need to be routed
/*
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Permissions from '../components/authorization/Permissions.vue'
import Roles from '../components/authorization/Roles.vue'
import Categories from '../components/goods/Categories.vue'
import Attributes from '../components/goods/Attributes.vue'
import Goods from '../components/goods/Goods.vue'
import AddGoods from '../components/goods/Add.vue'
import Orders from '../components/order/Orders.vue'
import Reports from '../components/statistics/Reports.vue'
*/

// Now we will use Vue's lazy loading routes

// The following three components will be loaded together
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
// The following one component will be loaded by itself
const Users = () => import(/* webpackChunkName: "users" */ '../components/user/Users.vue')
// The following two components will be loaded together
const Permissions = () => import(/* webpackChunkName: "authorization" */ '../components/authorization/Permissions.vue')
const Roles = () => import(/* webpackChunkName: "authorization" */ '../components/authorization/Roles.vue')
// The following four components will be loaded together
const Categories = () => import(/* webpackChunkName: "goods" */ '../components/goods/Categories.vue')
const Attributes = () => import(/* webpackChunkName: "goods" */ '../components/goods/Attributes.vue')
const Goods = () => import(/* webpackChunkName: "goods" */ '../components/goods/Goods.vue')
const AddGoods = () => import(/* webpackChunkName: "goods" */ '../components/goods/Add.vue')
// The following one component will be loaded by itself
const Orders = () => import(/* webpackChunkName: "orders" */ '../components/order/Orders.vue')
// The following one component will be loaded by itself
const Reports = () => import(/* webpackChunkName: "reports" */ '../components/statistics/Reports.vue')

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
      { path: '/roles', component: Roles },
      { path: '/categories', component: Categories },
      { path: '/attributes', component: Attributes },
      { path: '/goods', component: Goods },
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports }
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
