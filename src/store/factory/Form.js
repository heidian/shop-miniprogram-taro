import _ from 'lodash'
import { API } from '@/utils/api'

/*
Best practice 关于命名, 只有全局的 mutation, getters 等等才大写, 别的都小写
It is a commonly seen pattern to use constants for mutation types in various Flux implementations.
This allows the code to take advantage of tooling like linters, and putting all constants in a single file
allows your collaborators to get an at-a-glance view of what mutations are possible in the entire application.
*/

export default (urlRoot) => {
  if (!/\/$/.test(urlRoot)) urlRoot += '/'
  const url = (id) => urlRoot + id + '/'

  const namespaced = true

  const state = () => ({
    id: null,
    data: {},
    error: {},
    dirty: false,
    pending: false
  })

  const getters = {
    getField(state) {
      return (path, defaultValue) => _.get(state.data, path, defaultValue)
    },
    getError(state) {
      return (path, stringify = true) => {
        const error = _.get(state.error, path)
        if (stringify && _.isArray(error)) {
          return error.join(', ')
        } else {
          return _.toString(error)
        }
      }
    },
    getMetafield(state, getters) {
      return (namespace, key, defaultValue) => {
        const metafields = getters.getField('metafields', [])
        const metafield = _.find(metafields, { namespace, key })
        return _.get(metafield, 'value', defaultValue)
      }
    },
    getMetafieldError(state) {
      return (path, stringify = true) => {
        return null
      }
    }
  }

  const mutations = {
    updateField(state, payload = {}) {
      /* updateField 会导致 dirty, reset 不会 */
      state.dirty = true
      _.forEach(_.toPairs(payload), ([path, value]) => {
        _.set(state.data, path, value)
      })
      state.data = { ...state.data }
    },
    reset(state, { id, data } = {}) {
      /* reset 会重置 dirty, reset 一般用于初始化或者请求结束以后重置数据 */
      state.dirty = false
      state.pending = false
      state.error = {}
      state.data = _.cloneDeep(data || {})
      state.id = +id || +state.data.id || null
    },
    updateMetafield(state, { namespace, key, value, value_type: valueType }) {
      valueType || (valueType = 'string')
      state.dirty = true
      const metafields = _.get(state.data, 'metafields', [])
      const metafield = _.find(metafields, { namespace, key })
      if (metafield) {
        metafield.value = value
        metafield.value_type = valueType
      } else {
        metafields.push({ namespace, key, value, value_type: valueType })
      }
      state.data.metafields = [...metafields]
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
    retrieve({ commit, state }) {
      if (!state.id) {
        throw new Error("Can't retrieve item without id")
      }
      commit('REQUEST_STARTED')
      const id = state.id
      const promise = API.get(url(id))
      return promise.then((res) => {
        const data = res.data
        commit('reset', { id, data })
        commit('REQUEST_SUCCEEDED')
        return data
      }).catch((err) => {
        const error = _.get(err, 'response.data') || err
        commit('REQUEST_FAILED', { error })
        throw err
      })
      /*
       * 要传递 err 一定要写 catch, 不能写成 .then((res)=>{}, (err)=>{ throw err }),
       * 因为没有加 catch, then 的第二个回掉方法 throw err 以后会导致 Uncaught (in promise) Error
       * 因为 promise 认为这是 then 抛出来的 err
       */
    },
    save({ commit, state }, { partial, create } = {}) {
      commit('REQUEST_STARTED')
      let promise
      let id = state.id
      if (!id || create) {
        promise = API.post(urlRoot, state.data)
      } else {
        const method = !partial ? 'put' : 'patch'
        promise = API[method](url(id), state.data)
      }
      return promise.then((res) => {
        const data = res.data
        if (data.id) id = data.id
        commit('reset', { id, data })
        commit('REQUEST_SUCCEEDED')
        return data
      }).catch((err) => {
        const error = _.get(err, 'response.data') || err
        commit('REQUEST_FAILED', { error })
        throw err
      })
    },
    remove({ commit, state }) {
      if (!state.id) {
        throw new Error("Can't delete item without id")
      }
      commit('REQUEST_STARTED')
      const promise = API.delete(url(state.id))
      return promise.then((res) => {
        commit('REQUEST_SUCCEEDED')
        return {}
      }).catch((err) => {
        const error = _.get(err, 'response.data') || err
        commit('REQUEST_FAILED', { error })
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
