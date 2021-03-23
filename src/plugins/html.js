import _ from 'lodash'
import Taro from '@tarojs/taro'
import { parseUrl } from '@/utils/url'


/* 这个只在小程序端有效, H5 其实也应该处理, 只能另外想办法了 */
Taro.options.html.transformElement = (el) => {
  if (el.h5tagName === 'a') {
    // TODO 这里要研究下, 会不会内存溢出
    const handler = ((href) => {
      return function() {
        const parse = parseUrl(el.props.href)
        if (parse.openType === 'switchTab') {
          Taro.switchTab({ url: parse.url })
        } else if (parse.openType === 'navigate') {
          Taro.navigateTo({ url: parse.url })
        } else if (parse.openType === 'scrollToBlock') {
          Taro.pageScrollTo({ selector: `#block--${parse.url}` })
        }
      }
    })(el.props.href)
    el.addEventListener('tap', handler)
    // 如果把 a 转换成 navigator, 需要加一段样式 navigator.a { display: inline-block; }
    // el.nodeName = 'navigator'
    // el.tagName = 'NAVIGATOR'
    // const parse = parseUrl(el.props.href)
    // el.props.url = parse.url
    // el.props.openType = parse.openType
    // el.props.hoverClass = 'none'
  }
  const fontSize = _.get(el, 'style.fontSize')
  if (fontSize && /^\d+(\.\d+)?(px)?$/.test(fontSize)) {
    el.style.fontSize = Taro.pxTransform(fontSize)
  }
  return el
}
