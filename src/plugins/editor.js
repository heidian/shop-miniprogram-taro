import Taro, { getCurrentInstance } from '@tarojs/taro'
import store from '../store/index'


if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
  function listenFromStyleEditor(event) {
    // 通信的格式是 data: { sender, type, method, payload }
    if (!event.data || event.data['sender'] !== 'editor') {
      return
    }
    console.log('listenFromStyleEditor', event)
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
  if (typeof window !== 'undefined' && window.parent) {
    // event.data['sender'] !== 'xxx'  优化一下, 限定一下 sender
    window.addEventListener('message', listenFromStyleEditor)
  }
}
