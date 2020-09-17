import qs from 'qs'
import _ from 'lodash'

export const optimizeImage = (url, options) => {
  /* options 可以是一个数字, 表示宽度, 也可以是 { width, height, format } 的格式 */
  let metafield = {}
  if (typeof url === 'object') {
    metafield = _.get(url, 'metafield') || ''
    url = _.get(url, 'src') || ''
  }
  if (!url || !_.isString(url)) {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  }
  if (!/^(https|http):\/\/(up\.img\.heidiancdn\.com)\//.test(url)) {
    return url
  }
  if (typeof options !== 'object') {
    // options 是一个数字, 可能还需要检查下 +options > 0
    options = { width: +options }
  }
  const { width, height, format } = options
  if (!width) {
    width = 400
  }
  if (!format && metafield.mimeType === 'image/png' && (+metafield.size > 500 * 1024)) {
    // if (/\.png$/.test(url) ||
    // 小程序现在支持 webp 了, 强制转换, 任何格式都可以转换成 webp
    // 这个还不大确定兼容性, 目前暂时还是转成 jpg, 并且只对大的 png 图片进行处理
    format = 'jpg'  // webp
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
  let transform = `imageView2/2/w/${width * ratio}`
  if (height) {
    transform += `/h/${height * ratio}`
  }
  if (format) {
    transform += `/format/${format}`
  }
  return optimUrl + optimQueries.join('|')
}

export const backgroundImageUrl = (imageSrc, options) => {
  const safeImageSrc = optimizeImage(imageSrc, options).replace(
    /"/g,
    '%22'
  )
  return `url("${safeImageSrc}")`
}


export const DEFAULT_AVATAR = "https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png"
