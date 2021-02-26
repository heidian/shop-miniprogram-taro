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
      '--color-primary--light': tinycolor.mix('#ff5a00', '#fff', 25).toString(),
      '--color-primary--lighter': tinycolor.mix('#ff5a00', '#fff', 50).toString(),
      // '--color-text-light': '#666666',
      // '--color-orange': '#ff5a00',
      // '--color-blue': '#284179',
    }
  }
}

const mutations = {
  setGlobalColors(state, { colorBg, colorText, colorPrimary }) {
    if (colorPrimary) {
      state.globalColors['--color-primary'] = colorPrimary
      // state.globalColors['--color-primary--light'] = tinycolor(colorPrimary).lighten(5).toString()
      // state.globalColors['--color-primary--lighter'] = tinycolor(colorPrimary).lighten(30).toString()
      state.globalColors['--color-primary--light'] = tinycolor.mix(colorPrimary, '#fff', 25).toString()
      state.globalColors['--color-primary--lighter'] = tinycolor.mix(colorPrimary, '#fff', 50).toString()
    }
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
    commit('setGlobalColors', themeSettingsData)
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
