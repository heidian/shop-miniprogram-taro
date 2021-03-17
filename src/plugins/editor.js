import Taro, { getCurrentInstance } from '@tarojs/taro'
import store from '../store/index'
import _ from 'lodash'
import qs from 'qs'

const ShopminiMessageTypes = { READY: 'ready' }
const EditorMessageTypes = { UPDATE: 'update', SCROLL: 'scroll' }
const EditorMessageMethods = {
  RESET_BLOCKS: 'RESET_BLOCKS',
  ADD_BLOCK: 'ADD_BLOCK',
  REMOVE_BLOCK: 'REMOVE_BLOCK',
  REORDER_BLOCKS: 'REORDER_BLOCKS',
  UPDATE_BLOCK_SETTINGS_DATA: 'UPDATE_BLOCK_SETTINGS_DATA',
  UPDATE_BLOCK_CSS: 'UPDATE_BLOCK_CSS',
  UPDATE_BLOCK_VISIBILITY: 'UPDATE_BLOCK_VISIBILITY',
  UPDATE_THEME_SETTINGS_DATA: 'UPDATE_THEME_SETTINGS_DATA',
}

function _postMessage({ type='', method='', payload={} } = {})  {
  window.parent.postMessage({
    sender: 'shopmini_taro',
    type, method, payload,
  }, '*')
}

function listenFromStyleEditor(event) {
  // 通信的格式是 data: { sender, type, method, payload }
  if (!event.data || event.data['sender'] !== 'editor') {
    return
  }
  console.log('message from style editor', event)
  const { type, method, payload } = event.data
  // 每一个 case 下一定要写 return, 不然就顺序执行下去了
  if (type === EditorMessageTypes.UPDATE) {
    switch (method) {
      case EditorMessageMethods.RESET_BLOCKS:
        return store.commit('theme/resetBlocks', payload)
      case EditorMessageMethods.REORDER_BLOCKS:
        return store.commit('theme/reorderBlocks', payload)
      case EditorMessageMethods.ADD_BLOCK:
        return store.commit('theme/addBlock', payload)
      case EditorMessageMethods.REMOVE_BLOCK:
        return store.commit('theme/removeBlock', payload)
      case EditorMessageMethods.UPDATE_BLOCK_SETTINGS_DATA:
        return store.commit('theme/updateBlockSettingsData', payload)
      case EditorMessageMethods.UPDATE_BLOCK_CSS:
        return store.commit('theme/updateBlockCss', payload)
      case EditorMessageMethods.UPDATE_THEME_SETTINGS_DATA:
        return store.commit('theme/updateThemeSettingsData', payload)
      case EditorMessageMethods.UPDATE_BLOCK_VISIBILITY:
        return store.commit('theme/updateBlockVisibility', payload)
    }
  } else if (type === EditorMessageTypes.SCROLL) {
    if (method === 'SCROLL_TO_BLOCK') {
      const targetElement = window.document.getElementById(`block--${payload.id}`)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
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
  if (!pageType) {
    return
  }
  const key = (pageType && pageName) ? `${pageType}/${pageName}` : pageType
  const blocks = store.state.theme.blocksOfPage[key]
  const $scrollEl = window.document.getElementsByClassName('taro-tabbar__panel')[0]
  if (!$scrollEl) {
    return
  }
  const viewportBlocks = _.map(blocks, (block) => {
    const blockId = block.id
    const payload = { id: blockId, height: 0, offsetTop: 0 }
    const targetElement = window.document.getElementById(`block--${blockId}`)
    if (targetElement) {
      payload['height'] = targetElement.clientHeight
      payload['offsetTop'] = targetElement.offsetTop
    }
    return payload
  })
  const payload = {
    pageType,
    pageName,
    viewport: {
      scrollTop: $scrollEl.scrollTop || 0,
      blocks: viewportBlocks
    }
  }
  _postMessage({
    type: ShopminiMessageTypes.READY,
    payload
    // payload 格式是 { pageType, pageName, viewport: { blocks: [{ id, height, offsetTop }], scrollTop } }
  })
}

function initScrollListener() {
  updateBlocksSize()
  setTimeout(initScrollListener, 10)
}

if (Taro.getEnv() === Taro.ENV_TYPE.WEB && typeof window !== 'undefined' && window.parent) {
  window.addEventListener('message', listenFromStyleEditor)
  initScrollListener()
}
