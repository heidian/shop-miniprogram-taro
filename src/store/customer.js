/*
如果没有设置初始值, 也就是 state = () => ({})
那第一次 setData 好像 Vue 检测不到变化,
于是不会触发更新的回路
*/

import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

/*
 * onLaunch 会在每次打开网页的时候来读取 storate 里面的 customerToken,
 * 判断 customerToken 是否有效然后设置 isAuthenticated
 * 其他地方使用 isAuthenticated 来判断当前用户是否登录
 */
const state = () => {
  return {
    /* openid 因为一打开小程序就需要被 analytics 用到, 不能等 onLaunch 里面处理, 所以需要的地方都自己调用 getOpenID
    不要直接访问 openid, 因为它有可能是一个 Promise */
    openid: '',
    /* 除了 utils/api 文件里的 interceptor, 其他地方都不要直接访问 customerToken*/
    customerToken: '',
    isAuthenticated: false,
    data: {}
  }
}

const getters = {}

const mutations = {
  setData(state, payload = {}) {
    _.forEach(['openid', 'customerToken', 'isAuthenticated', 'data'], field => {
      if (typeof payload[field] !== 'undefined') {
        state[field] = payload[field]
      }
    })
  }
}

const actions = {
  async login({ rootGetters, commit, dispatch }, payload) {
    try {
      const { data } = await API.post('/customers/login/', {
        ...payload,
        context: rootGetters.getApiCampaignContext,
        source_name: 'miniprogram'
      }, {
        headers: { 'Authorization': '' }
      })
      const customerToken = data.token
      const customerData = _.pick(data, ['id', 'mobile', 'full_name'])
      Taro.setStorageSync('customerToken', customerToken)
      commit('setData', {
        customerToken: customerToken,
        data: customerData,
        isAuthenticated: true
      })
    } catch(err) {
      console.log('登录失败', _.get(err, 'response.data'))
      throw err
    }
    await dispatch('getCustomer')
    dispatch('cart/fetch', null, { root: true })  // 登录以后重新获取 cart
  },
  logout({ commit, dispatch }) {
    Taro.removeStorageSync('customerToken')
    commit('setData', {
      customerToken: '',
      data: {},
      isAuthenticated: false
    })
    dispatch('cart/fetch', null, { root: true })
    // 登出以后重新获取 cart, 这时 header 里的 carttoken 是错的, 但是没关系, 接口会直接忽略并返回空数据
  },
  getCustomer({ commit, dispatch }) {
    return API.get('/customers/customer/').then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('获取用户信息失败', _.get(err, 'response.data'))
      if (_.get(err, 'response.status') == 401 || _.get(err, 'response.status') == 403) {
        dispatch('logout')
      } else {
        throw err
      }
    })
  },
  updateCustomer({ commit }, payload) {
    return API.put('/customers/customer/', payload).then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('更新用户信息失败', _.get(err, 'response.data'))
      throw err
    })
  },
  async getOpenID({ rootState, state, commit }) {
    if (typeof state.openid === 'string' && state.openid) {
      return state.openid
    }
    if (state.openid instanceof Promise) {
      // 其他地方正在发起请求还没结束
      return await state.openid
    }
    const promise = new Promise((resolve, reject) => {
      const appid = rootState.config.appid
      const exchangeOpenID = ({ code }) => {
        API.post('/clients/wechat-auth-openid/', {
          js_code: code,
          appid: appid
        }).then((res) => {
          const openid = res.data.openid
          commit('setData', { openid })
          resolve(openid)
          /* 直接 resolve(openid), 这样就可以 return await promise */
        }).catch((err) => {
          console.log(err)
          Taro.showModal({
            title: '系统故障',
            content: '获取用户信息失败 (wechat-auth-openid)',
            showCancel: false
          })
        })
      }
      Taro.login({ success: exchangeOpenID })
    })
    commit('setData', { openid: promise })
    return await promise
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
