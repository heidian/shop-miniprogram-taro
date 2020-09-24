export default function(url) {
  const match = (url || '').match(/(wxpage|wxtab):\/\/(.+)/)
  if (match) {
    const [, openType, url] = match
    return {
      openType: openType === 'wxtab' ? 'switchTab' : 'navigate',
      url: '/' + url
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
