/**
 * main.js is the entrance of the entire project
 * In this file, we import some external JS objects into the project, import CSS into the project
 * Make some inital configurations
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// import tree table
import TreeTable from 'vue-table-with-tree-grid'
// import vue quill editor
import VueEditor from 'vue-quill-editor'
// require styles of this editor

// import global.css
import './assets/css/global.css'
// import font
import './assets/fonts/iconfont.css'
// import axios and do some basic configurations
import axios from 'axios'
// import nprogress bar
import NProgress from 'nprogress'

axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// set the interceptors of axios: add token to every http request before this request goes out
axios.interceptors.request.use(config => {
  NProgress.start() // start progress bar when AJAX request is initiated
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  NProgress.done() // hide progress bar when response is back
  return config
})
// mount axios to the property of Vue's prototype
Vue.prototype.$http = axios // every Vue component can use this.$http to make AJAX request

// register it as a component
Vue.component('tree-table', TreeTable)
// use Vue Quill Editor as global component
Vue.use(VueEditor /* { default global options } */)

Vue.config.productionTip = false

// filter used to parse time in goods list
Vue.filter('dateFormat', function(orignalVal) {
  const dt = new Date(orignalVal)
  const year = dt.getFullYear()
  const month = (dt.getMonth() + 1 + '').padStart(2, '0')
  const day = (dt.getDay() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
})

// create a Vue instance for this project
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
