// custom config for webpack is here
module.exports = {
  // change entry main.js file based on environment
  // production environment
  chainWebpack: config => {
    config.when(process.env.NODE_ENV === 'production', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')
      // to minimize the final bundle js file
      config.set('externals', {
        vue: 'Vue',
        // 'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // set isProd to true, this is for determining which environment we are in, dev or prod
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // development entry
    config.when(process.env.NODE_ENV === 'development', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')
      // set isProd to false, this is for determining which environment we are in, dev or prod
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
