import _ from 'lodash'
import Taro from '@tarojs/taro'
import { goToUrl, parseUrl } from '@/utils/url'


/* 这个只在小程序端有效, H5 其实也应该处理, 只能另外想办法了 */
Taro.options.html.transformElement = (el) => {
  if (el.h5tagName === 'br') {
    el.textContent = '\n'
  }
  if (el.h5tagName === 'a') {
    const handler = ((href) => {
      return () => goToUrl(href)
    })(el.props.href)
    /*
    TODO 这里要研究下, 会不会内存泄露
    TaroElement 有一个属性 __handlers, 里面记录了节点上绑定的事件,
    源码里面没体现出来，但是 Taro 很可能在其他地方会销毁这些事件
    */
    el.addEventListener('tap', handler)
  }
  const fontSize = _.get(el, 'style.fontSize')
  if (fontSize && /^\d+(\.\d+)?(px)?$/.test(fontSize)) {
    el.style.fontSize = Taro.pxTransform(fontSize)
  }
  return el
}


/*
// 备份一下把 a 转换成 navigator 的方案, 目前为了确保样式没问题, 采用监听 tap 事件的方案
// 如果把 a 转换成 navigator, 需要加一段样式 navigator.a { display: inline-block; }
el.nodeName = 'navigator'
el.tagName = 'NAVIGATOR'
const parse = parseUrl(el.props.href)
el.props.url = parse.url
el.props.openType = parse.openType
el.props.hoverClass = 'none'
*/
