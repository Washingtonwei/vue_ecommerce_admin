/**
 * main.js is the entrance of the entire project
 * We import some external JS objects into the project, import CSS into the project
 * Make some inital configurations
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import global.css
import './assets/css/global.css'
// import font
import './assets/fonts/iconfont.css'
// import axios and mount it to the property of Vue's prototype
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// add token to every http request
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios // every Vue component can use this.$http to make AJAX

Vue.config.productionTip = false
// create a Vue instance for this project
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
