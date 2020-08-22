/*
如果没有设置初始值, 也就是 state = () => ({})
那第一次 setCustomer 好像 Vue 检测不到变化,
于是不会触发更新的回路
*/

import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

/*
 * onLaunch 会在每次打开网页的时候调用 initCustomerToken action,
 * 判断 customerToken 是否有效然后设置 isAuthenticated
 * 其他地方使用 isAuthenticated 来判断当前用户是否登录
 */
const state = () => {
  return {
    customerToken: '',  // 除了 utils/api 文件里的 interceptor, 其他地方都不要直接访问这个值
    isAuthenticated: false,
    data: {}
  }
}

const getters = {}

const mutations = {
  setCustomer(state, { customerToken, isAuthenticated, data } = {}) {
    if (typeof customerToken !== 'undefined') {
      state.customerToken = customerToken
    }
    if (typeof isAuthenticated !== 'undefined') {
      state.isAuthenticated = isAuthenticated
    }
    if (typeof data !== 'undefined') {
      state.data = data
    }
  }
}

const actions = {
  initCustomerAuth({ commit }) {
    // 这里一定要用 sync, 确保 onLaunch 里面调用 initCustomerAuth 的时候, 可以在其他所有方法之前
    const token = Taro.getStorageSync('customertoken')
    commit('setCustomer', {
      customerToken: token || '',
      isAuthenticated: !!token
    })
  },
  login({ commit, dispatch }, { mobile, code }) {
    return API.post('/customers/login/', {
      mobile, code
    }, {
      headers: { 'Authorization': '' }
    }).then((res) => {
      const customerToken = res.data.token
      Taro.setStorageSync('customertoken', customerToken)
      commit('setCustomer', {
        customerToken: customerToken,
        isAuthenticated: true
      })
    }).catch((err) => {
      console.log('登录失败', _.get(err, 'response.data.detail'))
      throw err
    })
  },
  logout({ commit }) {
    Taro.removeStorageSync('customertoken')
    commit('setCustomer', {
      customerToken: '',
      isAuthenticated: true
    })
  },
  getCustomer({ commit }) {
    return API.get('/customers/customer/').then((res) => {
      commit('setCustomer', {
        data: res.data
      })
    }).catch((err) => {
      console.log('获取用户信息失败', _.get(err, 'response.data.detail'))
      throw err
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
