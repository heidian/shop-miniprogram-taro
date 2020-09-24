import _ from 'lodash'
import qs from 'qs'
import Vue from 'vue'
import Taro from '@tarojs/taro'
import VirtualList from '@tarojs/components/virtual-list'
import store from './store/index'
import { formatCurrency, formatDate, formatDateTime } from './utils/formatters'
import { optimizeImage } from './utils/image'
import parseScene from './utils/parseScene'
import analytics from './utils/analytics'

// Vue.config.productionTip = false


/*
 * 处理旧的路由, 重定向到新的路由
 */
Taro.onPageNotFound(function({ isEntryPage, path, query }) {
  console.log('PageNotFound', isEntryPage, path, query)
  if (/^pages\/(product|static|search)$/.test(path)) {
    Taro.redirectTo({ url: path + '/index?' + qs.stringify(query) })
  } else if (/^pages\/login$/.test(path)) {
    Taro.redirectTo({ url: '/pages/login/index' })
  } else if (/^pages\/member$/.test(path)) {
    Taro.switchTab({ url: '/pages/partner/index' })
  } else if (/^pages\/(account|categories)$/.test(path)) {
    Taro.switchTab({ url: '/pages/login/index' })
  }
  // else if (/^pages\/home$/.test(path)) {
  //   Taro.switchTab({ url: '/pages/home/index' })
  // }
})


/*
 * Global styles
 * 这里如果不引入, 全局样式和通用的组件样式都不会生效
 */
import './app.scss'


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
 * 监听路由变化, 用于发送 analytics 数据
 * 不要在 analytics 以外的场景使用 wx.onAppRoute, 这是个未公开的 API, 不能依赖于它
 */
try {
  wx.onAppRoute(res => {
    // console.log('DEBUG: 检测到路由变化 (优化一下这部分的代码, 移动到 analytics 单独的包里)\n', res)
    try {
      analytics.page()
    } catch(err) {
      console.log('analytics.page', err)
    }
  })
} catch(err) {
  console.log('wx.onAppRoute', err)
}


/*
 * Vue 渲染入口
 */
const App = new Vue({
  store,
  onLaunch(options) {
    const queryScene = decodeURIComponent(_.get(options, 'query.scene', ''))
    const { campaignContext, referralCode, redirect } = parseScene(queryScene)
    /* initClient 里面只是做一些 storage 相关的处理, 其他 dispatch 都直接在 onLaunch 里面调用 */
    this.$store.dispatch('initClient', { campaignContext, referralCode })
    if (this.$store.state.customer.isAuthenticated) {
      this.$store.dispatch('customer/getCustomer')
      this.$store.dispatch('partnerProfile/retrieve')
    }
    /* 如果一开始没有 fetch 一下 cart, 会出现的问题是 add 了以后, quantity 覆盖服务器上的 quantity
    这里不需要判断 customerToken 或 cartToken 是否存在, 如果是没登录也没创建过 cartToken, fetch 接口会返回空的 */
    this.$store.dispatch('cart/fetch')
    /* 最后再处理 redirect ? 这个可能最好放在最前面 */
    if (redirect) {
      Taro.navigateTo({ url: redirect })
    }
  },
  onShow(options) {},
  render(h) {
    // this.$slots.default 是将要会渲染的页面
    return h('block', this.$slots.default)
  }
})

export default App
