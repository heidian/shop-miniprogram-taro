import Vue from 'vue'
import store from './store/index'

// Vue.config.productionTip = false

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
  },
  onShow(options) {
  },
  render(h) {
    // this.$slots.default 是将要会渲染的页面
    return h('block', this.$slots.default)
  }
})

export default App
