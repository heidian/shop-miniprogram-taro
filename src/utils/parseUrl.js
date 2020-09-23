export default function(url) {
  const match = (url || '').match(/(wxpage|wxtab):\/\/(.+)/)
  if (match) {
    const [, openType, url] = match
    return {
      openType: openType === 'wxtab' ? 'switchTab' : 'navigate',
      url: '/' + url
    }
  } else {
    return {
      openType: 'navigate',
      url: ''
    }
  }
}
