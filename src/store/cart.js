import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

/*
 * onLaunch 会在每次打开网页的时候调用 initClient action 来读取 storate 里面的 customerToken,
 */
const state = () => {
  return {
    cartToken: '',
    totalPrice: '0.00',
    totalCount: 0,
    items: []
  }
}

const getters = {}

const mutations = {
  setData(state, { items, cartToken } = {}) {
    if (typeof cartToken !== 'undefined') {
      state.cartToken = cartToken
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
    // // this.cartToken = null
    // this.create().then(() => this.fetch(callback))
    if (!error.response) {
      throw error
    }
    const { status } = error.response
    if (status == 404 || status == 403 || status == 401) {
      Taro.removeStorageSync('cartToken')
      commit('setData', { cartToken: '', items: [] })
    }
  },
  async _create({ state, commit, dispatch }) {
    if (!state.cartToken) {
      try {
        const { data: { items, token: cartToken } } = await API.post('/customers/cart/')
        Taro.setStorageSync('cartToken', cartToken)
        commit('setData', { items, cartToken })
      } catch(err) {
        // 这里按理来说是不会遇到的, 只可能是 CustomerToken 错误导致 401/403
        dispatch('_flushCartOnError', err)
      }
    }
  },
  async fetch({ rootState, state, commit, dispatch }) {
    if (state.cartToken) {
      try {
        const { data: { items } } = await API.get(`/customers/cart/${state.cartToken}/`)
        commit('setData', { items })
      } catch(err) {
        dispatch('_flushCartOnError', err)
      }
    } else if (rootState.customer.isAuthenticated) {
      // 如果没登录, 就不要 create, 因为 create 了也是一个空的, 需要的时候再 create
      await dispatch('_create')
    } else {}
  },
  async add({ state, commit, dispatch }, { variantId, quantity, attributes = {} } = {}) {
    /* 调用 add 的时候如果 attributes 是空的, 也会覆盖之前的已有数据,
    这是和 setQuantity 不同的地方, add 一定要传完整的数据 */
    if (!state.cartToken) {
      await dispatch('_create')
    }
    const items = [ ...state.items ]
    const index = _.findIndex(items, (item) => _.get(item, 'variant.id') == variantId)
    let item = items[index]
    if (!item) {
      const variant = { id: variantId }
      item = { variant, quantity, attributes }
      items.push(item)
    } else {
      quantity = item.quantity + quantity
      items[index] = { ...item, quantity, attributes }
    }
    commit('setData', { items })
    // TODO, 这里要处理一下库存不足之类的问题
    await API.post(`/customers/cart/${state.cartToken}/item/`, {
      variant_id: item.variant.id,
      quantity: quantity,
      attributes: item.attributes
    })
    dispatch('fetch')
  },
  async setQuantity({ state, commit, dispatch }, { itemId, quantity } = {}) {
    if (!state.cartToken) {
      await dispatch('_create')
    }
    const index = _.findIndex(state.items, { id: itemId })
    const item = state.items[index]
    if (!item) {
      throw new Error('Invalid itemId')
    }
    const items = [
      ...state.items.slice(0, index),
      { ...item, quantity: quantity },
      ...state.items.slice(index + 1)
    ]
    commit('setData', { items })
    // TODO, 这里要处理一下库存不足之类的问题
    await API.post(`/customers/cart/${state.cartToken}/item/`, {
      variant_id: item.variant.id,
      quantity: quantity
    })
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
