import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import Taro from '@tarojs/taro'

import listStores from './lists/index'
import customerStore from './customer'
import partnerProfileStore from './partnerProfile'
import qiniuStore from './qiniu'
import cartStore from './cart'
import checkoutStore from './checkout'
import exampleStore from './example'
import systemStore from './system'
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
      '--color-bg': '#f6f6f6',
      '--color-text': '#262626',
      '--color-text-light': '#666666',
      '--color-orange': '#ff5a00',
      '--color-blue': '#284179',
    }
  }
}

const mutations = {
  setGlobalColors(state, payload) {
    state.globalColors = payload
  },
  setCampaignContext(state, payload) {
    state.campaignContext = payload
  },
  setReferralCode(state, payload) {
    state.referralCode = payload
  }
}

const actions = {
  initClient({ commit, dispatch }, { campaignContext, referralCode } = {}) {
    /* initClient 里面只是做一些 storage 相关的处理, 其他 dispatch 都直接在 onLaunch 里面调用 */
    const customerToken = Taro.getStorageSync('customerToken')
    if (customerToken) {
      commit('customer/setData', { customerToken, isAuthenticated: true })
    }
    const cartToken = Taro.getStorageSync('cartToken')
    if (cartToken) {
      commit('cart/setData', { cartToken })
    }
    /* 下面这些不是非常关键, 目前都用异步处理 */
    const promises = []
    if (campaignContext && !_.isEmpty(campaignContext)) {
      const promise = Taro.setStorage({
        key: '_campaign_context',
        data: { ...campaignContext, timestamp: (new Date()).valueOf() }
      })
      commit('setCampaignContext', campaignContext)
      promises.push(promise)
    } else {
      const promise = Taro.getStorage({ key: '_campaign_context' }).then((res) => {
        const campaignContext = _.omit(res.data, ['timestamp'])
        const timestamp = res.data.timestamp
        if (!timestamp || ((new Date()).valueOf() - timestamp) > 1000 * 86400 * 7) {
          Taro.removeStorage({ key: '_campaign_context' })
        } else {
          commit('setCampaignContext', campaignContext)
        }
      }).catch((err) => {/* 不存在, 什么也不处理 */})
      promises.push(promise)
    }
    if (referralCode) {
      const promise = Taro.setStorage({ key: '_referral_code', data: referralCode })
      commit('setReferralCode', referralCode)
      promises.push(promise)
    } else {
      const promise = Taro.getStorage({ key: '_referral_code' }).then((res) => {
        commit('setReferralCode', res.data)
      }).catch((err) => {/* 不存在, 什么也不处理 */})
      promises.push(promise)
    }
    return Promise.all(promises)
  }
}

const getters = {
  getApiCampaignContext(state) {
    const context = {}
    _.forEach(['name', 'source', 'medium', 'term', 'content'], (field) => {
      const value = state.campaignContext[field]
      if (value) {
        context[`campaign_${field}`] = value
      }
    })
    if (state.referralCode) {
      context.referrer__referral_code = state.referralCode
    }
    return context
  }
}

export default new Vuex.Store({
  modules: {
    lists: listStores,
    customer: customerStore,
    partnerProfile: partnerProfileStore,
    cart: cartStore,
    qiniu: qiniuStore,
    checkout: checkoutStore,
    example: exampleStore,
    system: systemStore,
    categories: categoriesStore,
  },
  state,
  mutations,
  actions,
  getters,
  strict: true,  // any mutations to Vuex state outside of mutation handlers will throw an Error
  plugins: process.env.NODE_ENV === 'development' ? [createLogger()] : []
})
