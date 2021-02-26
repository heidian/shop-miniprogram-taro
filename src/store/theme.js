import _ from 'lodash'
import tinycolor from 'tinycolor2'
import Taro from '@tarojs/taro'

const state = () => {
  return {
    globalColors: {
      '--color-bg': '#f6f6f6',
      '--color-text': '#262626',
      '--color-primary': '#ff5a00',
      // '--color-text-light': '#666666',
      // '--color-orange': '#ff5a00',
      // '--color-blue': '#284179',
    }
  }
}

const mutations = {
  setGlobalColors(state, payload) {
    state.globalColors = payload
  },
}

const actions = {}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
