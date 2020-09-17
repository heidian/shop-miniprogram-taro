import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

const state = () => {
  return {
    data: {}
  }
}

const getters = {}

const mutations = {
  setData(state, payload = {}) {
    _.forEach(['data'], field => {
      if (typeof payload[field] !== 'undefined') {
        state[field] = payload[field]
      }
    })
  }
}

const actions = {
  retrieve({ commit }) {
    return API.get('/substores/partners/profile/').then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('获取合伙人信息失败', _.get(err, 'response.data'))
      throw err
    })
  },
  update({ commit }, payload = {}) {
    return API.put('/substores/partners/profile/', payload).then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('更新合伙人信息失败', _.get(err, 'response.data'))
      throw err
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
