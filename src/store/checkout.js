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
    data: {},
    availableCouponCodes: [],
    availableVouchers: []
  }
}

const getters = {}

const mutations = {
  setData(state, { data, pending, checkoutToken, availableCouponCodes, availableVouchers } = {}) {
    if (typeof checkoutToken !== 'undefined') { state.checkoutToken = checkoutToken }
    if (typeof data !== 'undefined') { state.data = data }
    if (typeof pending !== 'undefined') { state.pending = pending }
    if (typeof availableCouponCodes !== 'undefined') { state.availableCouponCodes = availableCouponCodes }
    if (typeof availableVouchers !== 'undefined') { state.availableVouchers = availableVouchers }
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
      return data
    } catch(err) {
      commit('setData', { pending: false })
      throw err
    }
  },
  async fetchAvailableCouponCodes({ commit, state }) {
    commit('setData', { pending: true })
    const url = `/checkout/${state.checkoutToken}/available_coupon_codes/`
    try {
      const { data } = await API.get(url)
      commit('setData', { availableCouponCodes: data, pending: false })
      return data
    } catch(err) {
      commit('setData', { pending: false })
      throw err
    }
  },
  async addCoupon({ commit, state, dispatch }, { code, codePrefix } = {}) {
    const payload = codePrefix ? { codePrefix } : { code }
    const url = `/checkout/${state.checkoutToken}/add_coupon/`
    // commit('setData', { pending: true })
    try {
      await API.post(url, payload)
      // res 是 204 状态, 没数据需要 return
      // commit('setData', { pending: false })
    } catch(err) {
      // commit('setData', { pending: false })
      throw err
    }
    dispatch('fetch')
  },
  async updateAddress({ commit, state, dispatch }, { customerAddressId } = {}) {
    const paylod = { customer_address_id: customerAddressId }
    const url = `/checkout/${state.checkoutToken}/update_address/`
    try {
      await API.post(url, paylod)
    } catch(err) {
      throw err
    }
    dispatch('fetch')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
