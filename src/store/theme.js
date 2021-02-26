import _ from 'lodash'
import tinycolor from 'tinycolor2'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

function lightenColors(colorName, value) {
  const colors = { [colorName]: value }
  _.forEach([1, 2, 3, 4, 5], (level) => {
    // tinycolor(colorPrimary).lighten(5).toString()
    colors[`${colorName}--light-${level}`] = tinycolor.mix(value, '#fff', level * 10).toString()
  })
  return colors
}

const state = () => {
  return {
    globalColors: {
      '--color-bg': '#f6f6f6',
      '--color-text': '#262626',
      ...lightenColors('--color-primary', '#ff5a00'),
      // '--color-text-light': '#666666',
      // '--color-orange': '#ff5a00',
      // '--color-blue': '#284179',
    }
  }
}

const mutations = {
  setGlobalColors(state, { colorBg, colorText, colorPrimary }) {
    const globalColors = {}
    if (colorPrimary) {
      Object.assign(globalColors, lightenColors('--color-primary', colorPrimary))
    }
    state.globalColors = { ...state.globalColors, ...globalColors }
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
