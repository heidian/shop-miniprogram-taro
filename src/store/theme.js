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

function calcuKey(pageType, pageName) {
  return (pageType && pageName) ? `${pageType}/${pageName}` : (pageType ? pageType : '')
}

const state = () => {
  return {
    // themeSettings 和 pageBlocks 存储的都是原始数据
    themeSettings: {
      //
    },
    pageBlocks: {
      // [pageType/pageName]: [{ id, css, settings_data }, ...]
    }
  }
}

const getters = {
  globalColors(state) {
    const globalColors = {
      '--color-bg': '#f6f6f6',
      '--color-text': '#262626',
      ...lightenColors('--color-primary', '#ff5a00'),
      // '--color-text-light': '#666666',
      // '--color-orange': '#ff5a00',
      // '--color-blue': '#284179',
    }
    const {
      // 目前暂时还没有什么全局的设置
      colorBg, colorText, colorPrimary,
    } = state.themeSettings
    if (colorPrimary) {
      Object.assign(globalColors, lightenColors('--color-primary', colorPrimary))
    }
    if (colorBg) {
      Object.assign(globalColors, { '--color-bg': colorBg })
    }
    if (colorText) {
      Object.assign(globalColors, { '--color-text': colorText })
    }
    return { ...state.globalColors, ...globalColors }
  }
}

const mutations = {
  resetThemeSettings(state, { settingsData }) {
    state.themeSettings = {
      ...settingsData
    }
  },
  resetPageSettings(state, { pageType, pageName, settingsData }) {
    const key = calcuKey(pageType, pageName)
    // 如果不这么写, 新增一个 [key] 的时候, store 的变化不会被监听到
    state.pageBlocks = {
      ...state.pageBlocks,
      [key]: settingsData['components'],
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
    const settingsData = _.get(res.data, 'shop.theme.settings_data')
    commit('resetThemeSettings', { settingsData })
  },
  async fetchPage({ commit }, { pageType, pageName }) {
    // console.log(`get test pageconfig of ${pageType}`)
    // const pageConfig = getTestPageConfig(pageType, pageName)
    // const blocks = _.cloneDeep(pageConfig['settings_data']['components'])
    const params = {
      'fields[shop]': 'id',
      'fields[page]': 'title,pageconfig',
      'scope': 'miniprogram',
      // 'preview_theme_id': PREVIEW_THEME_ID,  // 上线以后要删掉
      'page_type': pageType
    }
    if (pageName) {
      params['name'] = pageName
    }
    const res = await API.get('/shopfront/shop/', { params })
    const settingsData = _.get(res.data, 'page.pageconfig.settings_data')
    commit('resetPageSettings', { pageType, pageName, settingsData })
    return res.data
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
