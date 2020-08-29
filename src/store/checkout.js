import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

/*
 * checkout 接口那 POST 的方法比如 add_coupon, 如果加了 2.0, 就会在调用以后进入 async 处理
 * 这时候 GET checkout 的时候有可能会需要等待
 */
const headers = {
  accept: 'application/json;version=2.0'
}

const state = () => {
  return {
    checkoutToken: '',
    pending: true,
    data: {}
  }
}

const getters = {}

const mutations = {
  setData(state, { data, pending, checkoutToken } = {}) {
    if (typeof checkoutToken !== 'undefined') {
      state.checkoutToken = checkoutToken
    }
    if (typeof data !== 'undefined') {
      state.data = data
    }
    if (typeof pending !== 'undefined') {
      state.pending = pending
    }
  }
}

const actions = {
  async fetch({ state, commit }) {
    const promise = new Promise((resolve, reject) => {
      const fetch = (count) => {
        API.get(`/checkout/${state.checkoutToken}/`).then((res) => {
          if (res.status !== 202) {
            resolve(res)
            return
          }
          const retryAfter = res.headers['retry-after'] || 10
          if (count > 5) {
            reject(new Error('polling too long ... ' + retryAfter))
            return
          }
          setTimeout(() => fetch(count + 1), retryAfter * 1000)
        }).catch((err) => {
          reject(err)
        })
      }
      fetch(0)
    })
    commit('setData', { pending: true })
    try {
      const { data } = await promise
      commit('setData', { data, pending: false })
    } catch(err) {
      commit('setData', { pending: false })
      throw err
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
