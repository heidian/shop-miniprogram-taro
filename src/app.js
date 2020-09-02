import Vue from 'vue'
import Taro from '@tarojs/taro'
import store from './store/index'
import { formatCurrency, formatDate, formatDateTime } from './utils/formatters'
import { optimizeImage } from './utils/image'
import VirtualList from '@tarojs/components/virtual-list'

/*
 * Global styles
 * 这里如果不引入, 全局样式和通用的组件样式都不会生效
 */
import './app.scss'

// Vue.config.productionTip = false

/*
 * 初始化 Taro 的 pxTransform
 */
Taro.initPxTransform({
  designWidth: 375,
  deviceRatio: {
    375: 1 / 2
  }
})

/*
 * 使用长列表组件
 * https://nervjs.github.io/taro/docs/virtual-list
 */
Vue.use(VirtualList)

/*
 * 定义全局 filters
 * TODO, 之后把这一段放进单独的文件里
 */
Vue.filter('date', (value) => formatDate(value))
Vue.filter('datetime', (value) => formatDateTime(value))
Vue.filter('currency', (value, options) => formatCurrency(value, options))
Vue.filter('imageUrl', (value, width, height) => optimizeImage(value, width, height))

/*
 * Vue 渲染入口
 */
const App = new Vue({
  store,
  onLaunch() {
    try {
      // 不要在 analytics 以外的场景使用 wx.onAppRoute, 这是个未公开的 API, 不能依赖于它
      wx.onAppRoute(res => {
        console.log('DEBUG: 检测到路由变化 (优化一下这部分的代码, 移动到 analytics 单独的包里)\n', res)
      })
    } catch(err) {
      console.log(err)
    }
    this.$store.dispatch('initClient')
  },
  onShow(options) {
  },
  render(h) {
    // this.$slots.default 是将要会渲染的页面
    return h('block', this.$slots.default)
  }
})

export default App
