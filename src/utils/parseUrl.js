export default function(url) {
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
