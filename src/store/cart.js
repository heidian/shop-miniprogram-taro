import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'


const state = () => {
  return {
    token: null,
    totalPrice: '0.00',
    totalCount: 0,
    items: []
  }
}

const getters = {}

const mutations = {
  setData(state, { items, token } = {}) {
    if (typeof token !== 'undefined') {
      state.token = token
    }
    if (typeof items !== 'undefined') {
      state.items = items
    }
    state.totalCount = _.reduce(state.items, (sum, item) => sum + (item.quantity || 0), 0)
    state.totalPrice = _.reduce(state.items, (sum, item) => sum + (item.quantity || 0) * (+item.price || 0), 0).toFixed(2)
  }
}

const actions = {
  async _flushCartOnError({ commit, dispatch }, error) {
    // TODO
    // wx.removeStorageSync('cartToken')
    // // this.token = null
    // this.create().then(() => this.fetch(callback))
    console.log(err)
    if (!err.response) {
      throw err
    }
    const { status } = err.response
    if (status == 404 || status == 403 || status == 401) {
      Taro.removeStorageSync('cartToken')
      commit('setData', { token: null, items: [] })
    }
  },
  async _create({ state, commit, dispatch }) {
    const token = Taro.getStorageSync('cartToken')
    if (token) {
      commit('setData', { token })
      dispatch('fetch')
      return
    }
    try {
      const { data: { items, token } } = await API.post('/customers/cart/')
      Taro.setStorageSync('cartToken', token)
      commit('setData', { items, token })
    } catch(err) {
      // 这里按理来说是不会遇到的, 只可能是 CustomerToken 错误导致 401/403
      dispatch('_flushCartOnError', err)
    }
  },
  async fetch({ rootState, state, commit }) {
    if (state.token) {
      try {
        const { data: { items } } = await API.get(`/customers/cart/${state.token}/`)
        commit('setData', { items })
      } catch(err) {
        dispatch('_flushCartOnError', err)
      }
    } else {
      // 如果没登录, 就不要 fetch
      console.log(rootState)
    }
  },
  async add({ state, commit, dispatch }, { variantId, attributes, quantity }) {
    if (!state.token) {
      await dispatch('_create')
    }
  },
  async setQuantity({ state, commit }) {
    //
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
