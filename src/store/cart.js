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
  _set({ commit }, payload) {
    const cartToken = payload.token || ''
    const items = payload.items || []
    commit('setData', { cartToken, items })
    if (cartToken) {
      Taro.setStorageSync('cartToken', cartToken)
    } else {
      Taro.removeStorageSync('cartToken')
    }
  },
  async _postVariant({ state, dispatch }, payload) {
    // TODO, 这里要处理一下库存不足之类的问题
    const res = await API.post('/shopfront/cart/', payload, {
      headers: {
        'X-Heidian-Cart-Token': state.cartToken
      }
    })
    dispatch('_set', res.data)
  },
  async fetch({ state, dispatch }) {
    const res = await API.get('/shopfront/cart/', {
      headers: {
        'X-Heidian-Cart-Token': state.cartToken
      }
    })
    dispatch('_set', res.data)
  },
  async add({ state, commit, dispatch }, { variantId, quantity, attributes = {} } = {}) {
    /* 调用 add 的时候如果 attributes 是空的, 也会覆盖之前的已有数据,
    这是和 setQuantity 不同的地方, add 一定要传完整的数据 */
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
    const payload = {
      variant_id: item.variant.id,
      quantity: quantity,
      attributes: item.attributes
    }
    await dispatch('_postVariant', payload)
  },
  async setItemQuantity({ state, commit, dispatch }, { itemId, quantity } = {}) {
    /* cartToken 不存在不需要报错, items 是空的, 本来就会报错 */
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
    const payload = {
      variant_id: item.variant.id,
      quantity: quantity
    }
    await dispatch('_postVariant', payload)
  },
  async removeItem({ state, commit, dispatch }, { itemId } = {}) {
    /* cartToken 不存在不需要报错, items 是空的, 本来就会报错 */
    const index = _.findIndex(state.items, { id: itemId })
    const item = state.items[index]
    if (!item) {
      throw new Error('Invalid itemId')
    }
    const items = _.filter(state.items, item => item.id != itemId)
    commit('setData', { items })
    const payload = {
      variant_id: item.variant.id,
      quantity: 0
    }
    await dispatch('_postVariant', payload)
  },
  async checkItem({ state, commit, dispatch }, { itemId, checked=true } = {}) {
    const index = _.findIndex(state.items, { id: itemId })
    const item = state.items[index]
    if (!item) {
      throw new Error('Invalid itemId')
    }
    const items = [
      ...state.items.slice(0, index),
      { ...item, checked: checked },
      ...state.items.slice(index + 1)
    ]
    commit('setData', { items })
    const payload = {
      variant_id: item.variant.id,
      checked: checked
    }
    await dispatch('_postVariant', payload)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
