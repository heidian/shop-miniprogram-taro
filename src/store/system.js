/**
 * 获取当前设备的信息，存在store里；
 * 如果有底部悬浮按钮的话，增加底部padding，防止iPhoneX底部按钮无法点击到
 * **/

import _ from 'lodash'
import Taro from '@tarojs/taro'

const state = () => {
  let systemInfo = {}
  try {
    const info = Taro.getSystemInfoSync()
    /*
     * 不是所有的值都是永远固定的, 比如 windowHeight 和 windowWidth 其实每个页面不同
     * 在设置了自定义顶部的页面, windowHeight 会更大, 在没有 tabbar 的页面, windowHeight 也会更大
     * 因为 windowHeight 的意思是内容高度, 一般都需要用的时候实时从 getSystemInfo 里面取
     * 所以 system store 这里只放不会改变的信息, 如果有需要就再加
     */
    systemInfo = _.pick(info, [
      'screenHeight', 'screenWidth', 'statusBarHeight', 'pixelRatio', 'devicePixelRatio',
      'system', 'model', 'brand', 'platform', 'version', 'SDKVersion',
    ])
  } catch (error) {
    systemInfo = {
      screenHeight: 667,
      screenWidth: 375,
      statusBarHeight: 20,
      pixelRatio: 2,
      devicePixelRatio: 2,
    }
  }
  return systemInfo
}

const mutations = {
  setData(state, payload) {
    state.data = _.cloneDeep(payload)
  }
}

const actions = {}

const getters = {
  isLikeIphoneX(state) {
    const { statusBarHeight, system } = state
    return statusBarHeight > 20 && /iOS/.test(system)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
