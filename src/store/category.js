import { API } from '@/utils/api'
import _ from 'lodash'

const urlRoot = '/shopfront/product_category/'
const state = {
  pending: false,
  ready: false,
  error: {},
  data: []
}

const mutations = {
  REQUEST_STARTED(state) {
    state.pending = true
    state.error = {}
  },
  REQUEST_SUCCEEDED(state) {
    state.pending = false
    state.ready = true
    state.error = {}
  },
  REQUEST_FAILED(state, { error } = {}) {
    state.pending = false
    state.error = _.cloneDeep(error || {})
  },
  setData (state, payload) {
    state.data = payload
  }
}

const actions = {
  list (context) {
    context.commit('REQUEST_STARTED')
    const promise = API.get(urlRoot)
    return promise.then(res => {
      const data = res.data || []
      context.commit('setData', data)
      context.commit('REQUEST_SUCCEEDED')
      return data
    }).catch(err => {
      const error = _.get(err, 'response.data') || err
      commit('REQUEST_FAILED', { error })
      throw err
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
