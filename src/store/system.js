/**
 * 获取当前设备的信息，存在store里；
 * 如果有底部悬浮按钮的话，增加底部padding，防止iPhoneX底部按钮无法点击到
 * **/

import _ from 'lodash'
import Taro from '@tarojs/taro'

const state = () => {
  let systemInfo = {}
  try {
    systemInfo = Taro.getSystemInfoSync()
  } catch (error) {}
  return {
    ...systemInfo
  }
}

const mutations = {
  setData (state, payload) {
    state.data = _.cloneDeep(payload)
  }
}

const actions = {
  getSystemInfo (context, number) {
    try {
      const res = Taro.getSystemInfoSync()
      context.commit('setData', res)
    } catch (error) {}
  }
}

const getters = {
  isLikeIphoneX (state) {
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
