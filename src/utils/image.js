import qs from 'qs'
import _ from 'lodash'

export const optimizeImage = (url, width, height) => {
  if (typeof url === 'object') {
    url = _.get(url, 'src') || ''
  }
  if (!url || !_.isString(url)) {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  }
  if (!/^(https|http):\/\/(up\.img\.heidiancdn\.com)\//.test(url)) {
    return url
  }
  if (!width) {
    width = 600
  }
  // const ratio = Math.ceil(global.devicePixelRatio || 1)
  // 小程序的 devicePixelRatio 不是这么取的, 先固定成 2
  const ratio = 2
  const [path, search] = url.split('?')
  let optimUrl = path + '?'  // 最终一定会有参数, 先加上 ?
  const optimQueries = []
  _.forEach(qs.parse(search), (value, key) => {
    if (/^(imageMogr2|imageView2)\//.test(key)) {
      optimQueries.push(key)
    } else {
      optimUrl += qs.stringify({ [key]: value }) + '&'
    }
  })
  if (_.isString(width)) {
    optimQueries.push(width)
  } else if (height) {
    optimQueries.push(`imageView2/2/w/${width * ratio}/h/${height * ratio}/ignore-error/1`)
  } else {
    optimQueries.push(`imageView2/2/w/${width * ratio}/ignore-error/1`)
  }
  return optimUrl + optimQueries.join('|')
}

export const backgroundImageUrl = (imageSrc, width, height) => {
  const safeImageSrc = optimizeImage(imageSrc, width, height).replace(
    /"/g,
    '%22'
  )
  return `url("${safeImageSrc}")`
}
