import Taro from '@tarojs/taro'

export function parseUrl(url) {
  const match = (url || '').match(/^(wxpage|wxtab|page|tab|block):\/\/(.+)$/)
  if (match) {
    const [, openType, url] = match
    if (openType === 'block') {
      return { openType: 'scrollToBlock', url: url }
    } else if (openType === 'wxtab' || openType === 'tab') {
      return { openType: 'switchTab', url: '/' + url }
    } else if (openType === 'wxpage' || openType === 'page') {
      return { openType: 'navigate', url: '/' + url }
    }
  } else if (/^(http|https):\/\/.+/.test(url)) {
    return {
      openType: 'navigate',
      url: '/pages/misc/webview?url=' + encodeURIComponent(url)
    }
  } else {
    // 需要解析一下 shopfront 链接
    return {
      openType: 'navigate',
      url: ''
    }
  }
}

export function goToUrl(url) {
  const parse = parseUrl(url)
  if (parse.openType === 'switchTab') {
    Taro.switchTab({ url: parse.url })
  } else if (parse.openType === 'navigate') {
    Taro.navigateTo({ url: parse.url })
  } else if (parse.openType === 'scrollToBlock') {
    Taro.pageScrollTo({ selector: `._block_${parse.url}` })
  }
}
