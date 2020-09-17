import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import Taro from '@tarojs/taro'

import listStores from './lists/index'
import customerStore from './customer'
import partnerProfileStore from './partnerProfile'
import clientsStore from './clients'
import cartStore from './cart'
import checkoutStore from './checkout'
import exampleStore from './example'
import categoriesStore from './categories'

Vue.use(Vuex)

const state = () => {
  return {
    config: {},
    campaignContext: {},
    referralCode: '',
    globalColors: {
      '--color-bg': '#ff0000',
      '--color-text': '#000000'
    }
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
  },
  setGlobalColors(state, payload) {
    state.globalColors = payload
  }
}

const actions = {
  async initClient({ commit, dispatch }) {
    const extConfig = Taro.getExtConfigSync()
    commit('setExtConfig', extConfig)
    const [customerToken, cartToken] = await Promise.all([
      Taro.getStorage({ key: 'customerToken' }).then(res => res.data).catch(() => {}),
      Taro.getStorage({ key: 'cartToken' }).then(res => res.data).catch(() => {}),
    ])
    if (customerToken) {
      commit('customer/setData', { customerToken, isAuthenticated: true })
    }
    if (cartToken) {
      commit('cart/setData', { cartToken })
    }
    if (customerToken) {
      dispatch('customer/getCustomer')
      dispatch('partnerProfile/retrieve')
    }
    /* 如果一开始没有 fetch 一下 cart, 会出现的问题是 add 了以后, quantity 覆盖服务器上的 quantity
    这里并不一定需要判断 customerToken 或 cartToken 是否存在, 如果是没登录也没创建过 cartToken, fetch 接口会返回空的 */
    if (customerToken || cartToken) {
      dispatch('cart/fetch')
    }

    dispatch('customer/getOpenID')
  }
}

const getters = {}

export default new Vuex.Store({
  modules: {
    lists: listStores,
    customer: customerStore,
    partnerProfile: partnerProfileStore,
    cart: cartStore,
    clients: clientsStore,
    checkout: checkoutStore,
    example: exampleStore,
    categories: categoriesStore,
  },
  state,
  mutations,
  actions,
  getters,
  strict: true,  // any mutations to Vuex state outside of mutation handlers will throw an Error
  plugins: process.env.NODE_ENV === 'development' ? [createLogger()] : []
})
