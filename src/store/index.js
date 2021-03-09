import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import Taro from '@tarojs/taro'

import listStores from './lists/index'
import customerStore from './customer'
import themeStores from './theme'
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
  const config = {
    apiroot: API_URL,
    shopname: '',
    shopid: '',
    appid: '',
  }
  if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
    // config/dev.js 里面定义了 API_URL, 但小程序的 apiroot 取的是 ext.json 的
    const { extAppid, apiroot, shopname, shopid } = Taro.getExtConfigSync()
    config.appid = extAppid
    config.apiroot = apiroot
    config.shopname = shopname
    config.shopid = shopid
  } else if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
    /* 本地测试的时候需要指定 API_URL 为店铺域名, 这样也就不需要 shopname 了
    shopname 和 shopid 单独使用只在 analytics 里面, 而网页版不启用 analytics, 所以空着没关系 */
    /* 线上部署的时候, API_URL 是 heidianapi.com, 然后从域名里面提取一下 shopname
    注意 apiroot 不能直接用 /api/ 因为这个版本的 xxx.heidian.mobi/api/ 没有解析到 shopbackend */
    const match = location.hostname.match(/^([a-zA-Z-]+)\.heidian\.mobi$/)
    if (match) {
      config.shopname = match[1]
    }
  }
  return {
    config: config,
    campaignContext: {},
    referralCode: '',
  }
}

const mutations = {
  setCampaignContext(state, payload) {
    state.campaignContext = payload
  },
  setReferralCode(state, payload) {
    state.referralCode = payload
  }
}

const actions = {
  initScene({ commit, dispatch }, { campaignContext, referralCode } = {}) {
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
    theme: themeStores,
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
  strict: process.env.NODE_ENV === 'development',
  // any mutations to Vuex state outside of mutation handlers will throw an Error
  // 太卡了, logger 先去掉
  // plugins: process.env.NODE_ENV === 'development' ? [createLogger()] : [],
})
