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
    customerToken: '',  // 除了 utils/api 文件里的 interceptor, 其他地方都不要直接访问这个值
    isAuthenticated: false,
    data: {}
  }
}

const getters = {}

const mutations = {
  setData(state, { customerToken, isAuthenticated, data } = {}) {
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
  },
  logout({ commit }) {
    Taro.removeStorageSync('customerToken')
    commit('setData', {
      customerToken: '',
      data: {},
      isAuthenticated: false
    })
  },
  getCustomer({ commit }) {
    return API.get('/customers/customer/').then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('获取用户信息失败', _.get(err, 'response.data'))
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
