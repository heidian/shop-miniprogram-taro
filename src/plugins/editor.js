import Taro, { getCurrentInstance } from '@tarojs/taro'
import store from '../store/index'
import _ from 'lodash'
import qs from 'qs'

function listenFromStyleEditor(event) {
  // 通信的格式是 data: { sender, type, method, payload }
  if (!event.data || event.data['sender'] !== 'editor') {
    return
  }
  console.log('message from style editor', event)
  const { type, method, payload } = event.data
  // 每一个 case 下一定要写 return, 不然就顺序执行下去了
  if (type === 'update') {
    switch (method) {
      case 'RESET_BLOCKS':
        return store.commit('theme/resetBlocks', payload)
      case 'REORDER_BLOCKS':
        return store.commit('theme/reorderBlocks', payload)
      case 'ADD_BLOCK':
        return store.commit('theme/addBlock', payload)
      case 'REMOVE_BLOCK':
        return store.commit('theme/removeBlock', payload)
      case 'UPDATE_BLOCK_SETTINGS_DATA':
        return store.commit('theme/updateBlockSettingsData', payload)
      case 'UPDATE_BLOCK_CSS':
        return store.commit('theme/updateBlockCss', payload)
      case 'UPDATE_THEME_SETTINGS_DATA':
        return store.commit('theme/updateThemeSettingsData', payload)
      case 'UPDATE_BLOCK_VISIBILITY':
        return store.commit('theme/updateBlockVisibility', payload)
    }
  }
}

function postMessage({type, payload})  {
  window.parent.postMessage({
    sender: 'shopmini_taro',
    type,
    payload
  }, "*")
}

function getCurrentPage() {
  const res = {}
  const { pathname, search } = window.location
  const query = qs.parse(search.replace('?', '')) || {}

  const pageName = search ? query.name : ''
  if (pathname === '/pages/static/index') {
    res.pageType = 'static'
    res.pageName = pageName
  } else if (pathname === '/pages/home') {
    res.pageType = 'home'
  } else if (pathname === '/pages/product/index') {
    res.pageType = 'product'
  } else if (pathname === '/pages/login/index') {
    res.pageType = 'login'
  }
  return res
}

function updateBlocksSize() {
  const { pageType, pageName } = getCurrentPage()
  const { blocksOfPage = {} } = store.state.theme
  const key = (pageType && pageName) ? `${pageType}/${pageName}` : pageType

  if (_.isEmpty(blocksOfPage[key])) return;

  const $scrollEl = document.getElementsByClassName('taro-tabbar__panel')[0]
  if (!$scrollEl) return;
  const payload = {
    scrollTop: $scrollEl.scrollTop || 0,
    blocksPositionData: {}
  }
  _.forEach(blocksOfPage[key], blockData => {
    const blockId = blockData.id
    if (blockId) {
      const targetElement = window.document.getElementById(`block--${blockId}`)
      if (targetElement) {
        payload.blocksPositionData[blockId] = {
          height: targetElement.clientHeight,
          offsetTop: targetElement.offsetTop
        }
      }
    }
  })
  postMessage({ type: 'scroll', payload })
}


function initScrollListener() {
  updateBlocksSize()
  setTimeout(initScrollListener, 10)
}

if (Taro.getEnv() === Taro.ENV_TYPE.WEB && typeof window !== 'undefined' && window.parent) {
  window.addEventListener('message', listenFromStyleEditor)

  initScrollListener()
}
