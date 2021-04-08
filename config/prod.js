module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
    API_URL: '"https://heidianapi.com/api/"',
    DEBUG_SHOP_NAME: '""'
  },
  mini: {
    sassLoaderOption: {
      sassOptions: {
        // 这么配置让生产环境编译 sass 前不要去除注释, 不然 /*postcss-pxtransform disable*/ 会失效
        // outputStyle: 'expanded'
      }
    }
  },
  h5: {
    /**
     * 如果h5端编译后体积过大，可以使用webpack-bundle-analyzer插件对打包体积进行分析。
     * 参考代码如下：
     * webpackChain (chain) {
     *   chain.plugin('analyzer')
     *     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
     * }
     */
  }
}
