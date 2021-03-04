import _ from 'lodash'
// import Vue from 'vue'
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
    // themeSettingsData 和 blocksOfPage 存储的都是原始数据
    themeSettingsData: {
      //
    },
    blocksOfPage: {
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
    } = state.themeSettingsData
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
  resetThemeSettingsData(state, { themeSettingsData }) {
    state.themeSettingsData = { ...themeSettingsData }
  },
  resetPageSettings(state, { pageType, pageName, pageSettingsData }) {
    const key = calcuKey(pageType, pageName)
    // 如果不这么写, 新增一个 [key] 的时候, store 的变化不会被监听到
    state.blocksOfPage = {
      ...state.blocksOfPage,
      [key]: pageSettingsData['components'],
    }
  },
  reorderBlocks(state, { pageType, pageName, ids }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      const blocksMap = {}
      _.forEach(blocks, (block) => blocksMap[block.id] = block)
      state.blocksOfPage[key] = _.map(ids, (id) => blocksMap[id])
    }
  },
  addBlock(state, { pageType, pageName, index, blockData }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      state.blocksOfPage[key] = [
        ...blocks.slice(0, index),
        blockData,
        ...blocks.slice(index),
      ]
    }
  },
  removeBlock(state, { pageType, pageName, id }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      state.blocksOfPage[key] = _.filter(blocks, (block) => block.id != id)
    }
  },
  updateBlockSettingsData(state, { pageType, pageName, id, blockSettingsData }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      const blockIndex = _.findIndex(blocks, { id })
      const settingsData = {
        ...blocks[blockIndex]['settings_data'],
        ...blockSettingsData,
      }
      blocks[blockIndex]['settings_data'] = settingsData
    }
  },
  updateBlockCSS(state, { pageType, pageName, id, blockCSS }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      const blockIndex = _.findIndex(blocks, { id })
      const css = {
        ...blocks[blockIndex]['css'],
        ...blockCSS,
      }
      blocks[blockIndex]['css'] = css
    }
  },
  updateThemeSettingsDate(state, { themeSettingsData }) {
    state.themeSettingsData = {
      ...state.themeSettingsData,
      ...themeSettingsData,
    }
  }
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
    commit('resetThemeSettingsData', { themeSettingsData })
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
    const pageSettingsData = _.get(res.data, 'page.pageconfig.settings_data')
    commit('resetPageSettings', { pageType, pageName, pageSettingsData })
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
