import qs from 'qs'
import _ from 'lodash'

export const optimizeImage = (url, width, height, toJpg) => {
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
  if (!width) {
    width = 400
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
  // if (/\.png$/.test(url) ||
  if (!!toJpg || (metafield.mimeType === 'image/png' && (+metafield.size > 500 * 1024))) {
    // 小程序现在支持 webp 了, 强制转换, 任何格式都可以转换成 webp
    // 这个还不大确定兼容性, 目前暂时还是转成 jpg, 并且只对大的 png 图片进行处理
    // optimQueries.push(`imageView2/2/format/webp/ignore-error/1`)
    optimQueries.push(`imageView2/2/format/jpg/ignore-error/1`)
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


export const DEFAULT_AVATAR = "https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png"