import _ from 'lodash'
import Vue from 'vue'
import Taro from '@tarojs/taro'

/*
 * 处理一些 H5 和 小程序 的兼容性问题
 */
if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
  const original = Taro.pxTransform
  Taro.pxTransform = function(size, designWidth) {
    return original.call(Taro, size, designWidth || 375)
  }
}

/*
 * 初始化 Taro 的 pxTransform
 */
Taro.initPxTransform({
  designWidth: 375,
  deviceRatio: {
    // 375: 1 / 2
    375: 2
  }
})

/*
 * 全局颜色变量
 */
Vue.mixin({
  computed: {
    '$globalColors': function() {
      // return this.$store.state.theme.globalColors
      return this.$store.getters['theme/globalColors']
    }
  }
})
// Vue.prototype.$globalColors = store.getters['theme/globalColors']
