import _ from 'lodash'
import { API } from '@/utils/api'

export default (urlRoot) => {
  if (!/\/$/.test(urlRoot)) urlRoot += '/'
  const url = (id) => urlRoot + id + '/'

  const namespaced = true

  const state = () => ({
    filter: {},
    orderBy: null,
    page: 1,
    pageSize: 10,
    count: 0,
    data: [],
    error: {},
    pending: false
  })

  const getters = {}

  const mutations = {
    setData(state, { count, data } = {}) {
      state.count = count || 0
      state.data = _.cloneDeep(data || [])
    },
    setParams(state, { filter, page, pageSize, orderBy } = {}) {
      /* 不传任何参数就是 reset */
      state.filter = _.cloneDeep(filter || {})
      state.page = page || 1
      state.pageSize = pageSize || 10
      state.orderBy = orderBy || null
    },
    setFilter(state, filter) {
      state.filter = _.cloneDeep(filter || {})
    },
    setPage(state, page) {
      state.page = page || 1
    },
    setPageSize(state, pageSize) {
      state.pageSize = pageSize || 10
    },
    setOrderBy(state, orderBy) {
      state.orderBy = orderBy || null
    },
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
    }
  }

  const actions = {
    listNext() {},
    listPrev() {},
    // list({ commit, state }, params) {
    //   if (params) {
    //     /* TODO 这是为了兼容 */
    //     // const { filter, page, pageSize, orderBy } = params
    //     commit('setParams', params)
    //   }
    list({ commit, state }, { append = false } = {}) {
      const { filter, page, pageSize, orderBy } = state
      commit('REQUEST_STARTED')
      const promise = API.get(urlRoot, {
        params: {
          ...filter,
          page,
          page_size: pageSize,
          order_by: orderBy
        }
      })
      return promise.then((res) => {
        const data = res.data
        const payload = _.isArray(data)? {
          count: data.length,
          data
        } : {
          count: data.count,
          data: data.results
        }
        commit('REQUEST_SUCCEEDED')
        commit('setData', {
          count: payload.count,
          data: append ? [ ...state.data, ...payload.data ] : payload.data,
        })
        return payload  // 只 return 本次请求取的数据
      }).catch((err) => {
        const error = _.get(err, 'response.data') || err
        commit('REQUEST_FAILED', { error })
        throw err
      })
    },
    create({ commit }, { data } = {}) {
      commit('REQUEST_STARTED')
      const promise = API.post(urlRoot, data)
      return promise.then((res) => {
        commit('REQUEST_SUCCEEDED')
        return res.data
      }).catch((err) => {
        const error = _.get(err, 'response.data') || err
        commit('REQUEST_FAILED', { error })
        throw err
      })
    },
    remove({ commit }, { id }) {
      commit('REQUEST_STARTED')
      const promise = API.delete(url(id))
      return promise.then((res) => {
        commit('REQUEST_SUCCEEDED')
        return {}
      }).catch((err) => {
        const error = _.get(err, 'response.data') || err
        commit('REQUEST_FAILED', { error }) // 这里设置 error 不大合理, 可以考虑把 remove 变成一个纯粹的方法, 不改动 state
        throw err
      })
    }
  }

  return {
    namespaced,
    state,
    getters,
    mutations,
    actions
  }
}
