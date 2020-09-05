import { API } from '@/utils/api'
import _ from 'lodash'

const state = () => {
  return {
    _fetched: false,  // categories 只运行一次
    pending: false,
    error: {},
    data: []
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
  setData (state, { data } = {}) {
    state.data = _.cloneDeep(data || [])
    state._fetched = true
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
  mutations,
  actions
}
