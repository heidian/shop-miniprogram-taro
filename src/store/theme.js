import _ from 'lodash'
import tinycolor from 'tinycolor2'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

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

const actions = {
  async fetchTheme({ commit }, payload) {
    const params = {
      'fields[shop]': 'id,theme',
      'scope': 'miniprogram',
      // 'preview_theme_id': PREVIEW_THEME_ID,  // 上线以后要删掉
    }
    const res = await API.get('/shopfront/shop/', { params })
    const themeSettingsData = _.get(res.data, 'shop.theme.settings_data')
    console.log(themeSettingsData)
  }
}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
