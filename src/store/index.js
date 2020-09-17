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

/* state.config 的处理和其他 state 不同
一定要在项目最前面就设置好 extConfig, 不要到了 onLaunch 再设置它,
确保比如 getOpenId 等其他任何地方一定可以获得 appid */
const state = () => {
  const { extAppid, apiroot, shopname, shopid } = Taro.getExtConfigSync()
  return {
    config: {
      appid: extAppid,
      apiroot,
      shopname,
      shopid
    },
    campaignContext: {},
    referralCode: '',
    globalColors: {
      '--color-bg': '#ff0000',
      '--color-text': '#000000'
    }
  }
}

const mutations = {
  setGlobalColors(state, payload) {
    state.globalColors = payload
  }
}

const actions = {
  async initClient({ commit, dispatch }) {
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
