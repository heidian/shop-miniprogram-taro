import _ from 'lodash'
import Vue from 'vue'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import store from './store/index'
import parseScene from './utils/parseScene'
import analytics from './utils/analytics'
// Vue.config.productionTip = false

/*
 * Plugins 一些全局的配置
 */
import './plugins/styles'
import './plugins/filters'
import './plugins/redirects'
import './plugins/html'
import './plugins/editor'

/*
 * Global styles
 * 这里如果不引入, 全局样式和通用的组件样式都不会生效
 */
import './app.scss'


/*
 * 来源追踪和数据分析
 */
if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
  // 只对微信小程序启用这个 mixin, 其中也包括了 analytics, 也就是说网页版也不会不启用 analytics
  Vue.mixin({
    /*
     * 注意, 千万不要在任何其他页面里定义 onLoad, 如果定义了就会覆盖这个 mixin,
     * 如果覆盖了, 那这一页就不能再作为分享小程序码的落地页了
     */
    onLoad() {
      const params = getCurrentInstance().router.params || {}
      if (params.redirect) {
        // 这个参数目前只作用于下单成功以后 "返回个人中心并跳转订单详情页", 当然落地页不一定要是 account
        // 目前带 redirect 参数一定是 reLaunch 过来的, 只能在 onLoad 里面调用, (到达当前页面后, 触发 redirect 到目标页)
        // 因为 account 是一个 tab, 这个参数会一直存在生命周期里, 一定不要在其他方法里处理这个它, 不然可能导致被多次处理
        Taro.navigateTo({ url: decodeURIComponent(params.redirect) })
      } else if (params.scene) {
        // const queryScene = decodeURIComponent(_.get(options, 'query.scene', ''))
        const queryScene = decodeURIComponent(params.scene)
        const { campaignContext, referralCode, redirect } = parseScene(queryScene)
        this.$store.dispatch('initScene', { campaignContext, referralCode }).then(() => {
          // analytics.listenToRoute 要放在 initScene 以后确保 campaignContext 已经有了
          analytics.listenToRoute()
        }).catch((err) => { console.log(err) })
        /* 在这里处理 redirect 对吗 ? */
        if (redirect) {
          Taro.navigateTo({ url: redirect })
        }
      }
    }
  })
}


/*
 * Vue 渲染入口
 */
const App = new Vue({
  store,
  onLaunch(options) {
    /*
     * 如果打开过小程序, 在进程关闭之前, 再次扫二维码或者点小程序卡片, 不会触发 onLaunch, 但是会触发页面的 onLoad
     * 如果直接从小程序历史里面点开, 只会触发 onShow, 连页面的 onLoad 也不会触发
     * 所以为了确保每次点开小程序卡片和扫描小程序码都可以解析参数, 应该在 home 的 onLoad 里面做 parseScene
     * 方案是, 使用 Vue.mixin
     */
    const customerToken = Taro.getStorageSync('customerToken')
    if (customerToken) {
      this.$store.commit('customer/setData', { customerToken, isAuthenticated: true })
    }
    const cartToken = Taro.getStorageSync('cartToken')
    if (cartToken) {
      this.$store.commit('cart/setData', { cartToken })
    }
    if (this.$store.state.customer.isAuthenticated) {
      this.$store.dispatch('customer/getCustomer')
    }
    /* 这是唯一会触发获取主题配置的地方 */
    this.$store.dispatch('theme/fetchTheme')
    /* 如果一开始没有 fetch 一下 cart, 会出现的问题是 add 了以后, quantity 覆盖服务器上的 quantity
    这里不需要判断 customerToken 或 cartToken 是否存在, 如果是没登录也没创建过 cartToken, fetch 接口会返回空的 */
    this.$store.dispatch('cart/fetch')
  },
  onShow(options) {},
  render(h) {
    // this.$slots.default 是将要会渲染的页面
    return h('block', this.$slots.default)
  }
})

export default App


/*
 * 使用长列表组件
 * https://nervjs.github.io/taro/docs/virtual-list
 */
// import VirtualList from '@tarojs/components/virtual-list'
// Vue.use(VirtualList)
