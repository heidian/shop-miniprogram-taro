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
  initClient({ commit }) {
    const extConfig = Taro.getExtConfigSync()
    commit('setExtConfig', extConfig)
    // 这里一定要用 sync, 确保 onLaunch 里面调用 initCustomerAuth 的时候, 可以在其他所有方法之前
    const customerToken = Taro.getStorageSync('customerToken')
    commit('customer/setData', {
      customerToken: customerToken || '',
      isAuthenticated: !!customerToken
    })
    const cartToken = Taro.getStorageSync('cartToken')
    commit('cart/setData', {
      cartToken: cartToken || ''
    })
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
