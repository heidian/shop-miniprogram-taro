import Vue from 'vue'
import Vuex from 'vuex'
import Taro from '@tarojs/taro'

import listStores from './lists/index'
import customerStore from './customer'
import cartStore from './cart'
import exampleStore from './example'

Vue.use(Vuex)

const state = () => {
  return {
    config: {}
  }
}

const mutations = {
  setExtConfig(state, payload) {
    const { extAppid, apiroot, shopname, shopid } = payload
    state.config = {
      appid: extAppid,
      apiroot,
      shopname,
      shopid
    }
  }
}

const actions = {
  initClient({ commit, dispatch }) {
    const extConfig = Taro.getExtConfigSync()
    commit('setExtConfig', extConfig)
    // 这里一定要用 sync, 确保 onLaunch 里面调用 initCustomerAuth 的时候, 可以在其他所有方法之前
    const customerToken = Taro.getStorageSync('customerToken')
    if (customerToken) {
      commit('customer/setData', {
        customerToken: customerToken,
        isAuthenticated: true
      })
    }
    const cartToken = Taro.getStorageSync('cartToken')
    if (cartToken) {
      commit('cart/setData', {
        cartToken: cartToken
      })
    }
    /* 如果一开始没有 fetch 一下 cart, 会出现的问题是 add 了以后, quantity 覆盖服务器上的 quantity
    这里不需要判断 customerToken 或 cartToken 是否存在, 如果是没登录也没创建过 cartToken, fetch 也没问题 */
    dispatch('cart/fetch')
  }
}
const getters = {}

export default new Vuex.Store({
  modules: {
    lists: listStores,
    customer: customerStore,
    cart: cartStore,
    example: exampleStore
  },
  state,
  mutations,
  actions,
  getters
})
