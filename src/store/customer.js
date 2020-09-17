/*
如果没有设置初始值, 也就是 state = () => ({})
那第一次 setData 好像 Vue 检测不到变化,
于是不会触发更新的回路
*/

import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

/*
 * onLaunch 会在每次打开网页的时候调用 initClient action 来读取 storate 里面的 customerToken,
 * 判断 customerToken 是否有效然后设置 isAuthenticated
 * 其他地方使用 isAuthenticated 来判断当前用户是否登录
 */
const state = () => {
  return {
    openid: '',
    customerToken: '',  // 除了 utils/api 文件里的 interceptor, 其他地方都不要直接访问这个值
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
  async login({ commit, dispatch }, payload) {
    try {
      const { data } = await API.post('/customers/login/', {
        ...payload
      }, {
        headers: { 'Authorization': '' }
      })
      const customerToken = data.token
      Taro.setStorageSync('customerToken', customerToken)
      commit('setData', {
        customerToken: customerToken,
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
  getCustomer({ commit }) {
    return API.get('/customers/customer/').then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('获取用户信息失败', _.get(err, 'response.data'))
      throw err
    })
  },
  updateCustomerProfile({ commit }, payload) {
    return API.put('/customers/customer/', payload).then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('更新用户信息失败', _.get(err, 'response.data'))
      throw err
    })
  },
  getOpenID({ rootState, commit }) {
    const appid = rootState.config.appid
    const exchangeOpenID = ({ code }) => {
      API.post('/clients/wechat-auth-openid/', {
        js_code: code,
        appid: appid
      }).then((res) => {
        const openid = res.data.openid
        commit('setData', { openid })
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
