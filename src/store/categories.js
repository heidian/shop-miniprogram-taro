import _ from 'lodash'
import { API } from '@/utils/api'

const state = () => {
  return {
    _fetched: false,  // categories 只运行一次
    _rootCategory: {},
    pending: false,
    error: {},
    data: []
  }
}

const getters = {
  getRootCategoryId(state) {
    return (categoryId) => {
      return state._rootCategory[categoryId] || null
    }
  }
}

const mutations = {
  REQUEST_STARTED(state) {
    state.pending = true
    state.error = {}
  },
  REQUEST_SUCCEEDED(state) {
    state.pending = false
    state.error = {}
  },
  REQUEST_FAILED(state, { error } = {}) {
    state.pending = false
    state.error = _.cloneDeep(error || {})
  },
  setData(state, { data } = {}) {
    state._fetched = true
    state.data = _.cloneDeep(data || [])
    const rootCategory = {}
    _.forEach(state.data, (category) => {
      rootCategory[category.id] = category.id
      _.forEach(category.children || [], (subCategory) => {
        rootCategory[subCategory.id] = category.id
      })
    })
    state._rootCategory = rootCategory
  }
}

const actions = {
  async list({ state, commit }) {
    if (state._fetched) {
      return state.data
    }
    commit('REQUEST_STARTED')
    try {
      const { data } = await API.get('/shopfront/product_category/')
      commit('setData', { data })
      commit('REQUEST_SUCCEEDED')
      return data
    } catch(err) {
      const error = _.get(err, 'response.data') || err
      commit('REQUEST_FAILED', { error })
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
