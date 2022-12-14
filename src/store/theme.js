import _ from 'lodash'
import Vue from 'vue'
import tinycolor from 'tinycolor2'
import Taro from '@tarojs/taro'
import { syncTabBarStyleWithTheme } from '@/utils'
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
  return pageType === 'static' ? `${pageType}/${pageName}` : pageType
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
      _.extend(globalColors, lightenColors('--color-primary', colorPrimary))
    }
    if (colorBg) {
      _.extend(globalColors, { '--color-bg': colorBg })
    }
    if (colorText) {
      _.extend(globalColors, { '--color-text': colorText })
    }
    return { ...state.globalColors, ...globalColors }
  }
}

const mutations = {
  resetThemeSettingsData(state, { themeSettingsData }) {
    state.themeSettingsData = { ...themeSettingsData }
    syncTabBarStyleWithTheme()
  },
  // resetPageSettings(state, { pageType, pageName, pageSettingsData }) {
  //   const key = calcuKey(pageType, pageName)
  //   // 如果不这么写, 新增一个 [key] 的时候, store 的变化不会被监听到
  //   state.blocksOfPage = {
  //     ...state.blocksOfPage,
  //     [key]: pageSettingsData['components'] || [],
  //   }
  // },
  resetBlocks(state, { pageType, pageName, blocks }) {
    const key = calcuKey(pageType, pageName)
    // blocks 的格式是 [{ id, css, settings_data }, ...]
    // 如果不这么写, 新增一个 [key] 的时候, store 的变化不会被监听到
    state.blocksOfPage = {
      ...state.blocksOfPage,
      [key]: blocks,
    }
    // state.blocksOfPage[key] = blocks
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
  updateBlockSettingsData(state, { pageType, pageName, id, settingsData, partial }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      const blockIndex = _.findIndex(blocks, { id })
      blocks[blockIndex]['settings_data'] = partial ? {
        ...blocks[blockIndex]['settings_data'],
        ...settingsData,
      } : { ...settingsData }
      // TODO: 只是上面那么写似乎可以监听到新添加的板块的变化, 所以不需要下面这句
      // state.blocksOfPage[key] = [ ...blocks ]
    }
  },
  updateBlockCss(state, { pageType, pageName, id, css, partial }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      const blockIndex = _.findIndex(blocks, { id })
      blocks[blockIndex]['css'] = partial ? {
        ...blocks[blockIndex]['css'],
        ...css,
      } : { ...css }
      // TODO: 只是上面那么写似乎可以监听到新添加的板块的变化, 所以不需要下面这句
      // state.blocksOfPage[key] = [ ...blocks ]
    }
  },
  updateBlockVisibility(state, { pageType, pageName, id, hidden }) {
    const key = calcuKey(pageType, pageName)
    const blocks = state.blocksOfPage[key]
    if (blocks) {
      const blockIndex = _.findIndex(blocks, { id })
      blocks[blockIndex]['hidden'] = hidden
    }
  },
  updateThemeSettingsData(state, { settingsData }) {
    state.themeSettingsData = {
      ...state.themeSettingsData,
      ...settingsData,
    }
    syncTabBarStyleWithTheme()
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
      'fields[shop]': 'id,title',
      'fields[page]': 'id,title,pageconfig,body_html',
      // body_html 在 static/index.vue 里面要用, 主要是给 PageSingleBodyHtml 板块
      'scope': 'miniprogram',
      // 'preview_theme_id': PREVIEW_THEME_ID,  // 上线以后要删掉
      'page_type': pageType
    }
    if (pageName) {
      params['name'] = pageName
    }
    const res = await API.get('/shopfront/shop/', { params })
    const pageSettingsData = _.get(res.data, 'page.pageconfig.settings_data')
    // commit('resetPageSettings', { pageType, pageName, pageSettingsData })
    const blocks = _.map(pageSettingsData['components'] || [], (block, index) => {
      const id = block.id || `index-${index}`
      // 确保每个 block 都有一个 id 属性, 这个是为了渲染不出错
      // 另外在建站工具模式下如果发现 id 缺失, 应该和工具通信, 修补 id !!!
      return { ...block, id }
    })
    commit('resetBlocks', { pageType, pageName, blocks })
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
