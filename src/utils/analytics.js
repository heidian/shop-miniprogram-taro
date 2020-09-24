import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import store from '../store/index'

const WRITEKEY = 'DdM5HrcuKbuhKJlUKKhNodF2M8SAbHDp'
const CONTEXT = {
  library: {
    // name: 'analytics-miniprogram',
    // version: '0.0.1'
    name: 'analytics.js',
    version: 'mini-1.0.0'
  },
  userAgent: 'MiniProgram'
}

!(function () {
  // 小程序代码里没法访问 navigator, 只能在 console 里面访问, 所以就算了, 直接 userAgent 写 MiniProgram 其实也方便做数据统计
  // if (typeof navigator !== 'undefined') {
  //   CONTEXT['userAgent'] = navigator.userAgent || 'MiniProgram'
  // }
  function success(info) {
    CONTEXT['locale'] = (info.language || '').replace('_', '-')
    CONTEXT['app'] = {
      // app 里面存小程序版本信息
      version: info.version, // 微信版本号
      build: info.SDKVersion, // 基础库版本
      name: 'MiniProgram'
    }
    CONTEXT['device'] = {
      manufacturer: info.brand, // 设备品牌
      model: info.model, // 设备型号
      type: info.platform // 客户端平台, 比如 ios
    }
    try {
      const i = info.system.lastIndexOf(' ')
      CONTEXT['os'] = {
        name: info.system.substr(0, i), // info.platform 是目前最接近操作系统名称的
        version: info.system.substr(i + 1) // info.system 里的值是操作系统名称加版本号
      }
    } catch (e) {}
    CONTEXT['screen'] = {
      width: info.screenWidth,
      height: info.screenHeight,
      density: info.pixelRatio
    }
  }
  Taro.getSystemInfo({ success })
})()

function getPageContext() {
  const { appid, shopname } = store.state.config
  const currentPage = _.last(getCurrentPages())
  if (!currentPage || !_.get(currentPage, 'route')) {
    return CONTEXT
  }
  const fakeDomain = `${appid}.${shopname}.miniprogram`
  const pathname = _.get(currentPage, 'route') || ''
  // pageName 的字段是代码里自己定义的
  const name =
    _.get(currentPage, 'data.pageName') || pathname.replace(/^pages\//, '')
  const title = _.get(currentPage, 'data.navigationBarTitleText') || name
  let search = _.map(currentPage.options || [], function (val, key) {
    var v = encodeURIComponent(val)
    return `${key}=${v}`
  }).join('&')
  search && (search = `?${search}`) // 标准的写法是 search 单个字段也是带 ? 的
  const properties = {
    name: name,
    title: title,
    path: pathname,
    search: search,
    url: `https://${fakeDomain}/${pathname}${search}`
  }
  return _.extend({}, CONTEXT, {
    page: properties
  })
}

class Analytics {
  constructor() {}

  _pageContext() {
    return {
      ...getPageContext(),
      campaign: { ...store.state.campaignContext }
    }
  }

  _anonymousId() {
    store.dispatch('customer/getOpenID').then((openid) => {
      return 'openid-' + openid
    }).catch((err) => { console.log(err) })
  }

  async identify(customerId, traits) {
    /* 这个方法不会被执行 (utils/customer.js) 为了节省 segment.io 的消耗
    如果要执行, 那 page 以及 track 就不能设置 'anonymous-id-override' */
    const context = this._pageContext()
    const anonymousId = await this._anonymousId()
    traits = Object.assign(
      {
        customer_id: customerId // 把真实的 customerid 用 property 存下来
      },
      traits
    )
    const data = {
      userId: customerId,
      anonymousId: anonymousId,
      traits: traits,
      context: context,
      writeKey: WRITEKEY
    }
    const url = 'https://segment.heidian.io/v1/identify'
    await API.post(url, data)
  }

  async track(event, properties) {
    const { shopid, shopname } = store.state.config
    const context = this._pageContext()
    const anonymousId = await this._anonymousId()
    const _properties = Object.assign({}, properties, {
      shop_id: shopid,
      shop_name: shopname,
      anonymous_id_override: anonymousId
    })
    const data = {
      anonymousId: 'anonymous-id-override',
      event: event,
      properties: _properties,
      context: context,
      writeKey: WRITEKEY
    }
    const url = 'https://segment.heidian.io/v1/track'
    await API.post(url, data)
  }

  async page() {
    const context = this._pageContext()
    if (!context.page) {
      return
    }
    const { shopid, shopname } = store.state.config
    const anonymousId = await this._anonymousId()
    const _properties = Object.assign({}, context.page, {
      shop_id: shopid,
      shop_name: shopname,
      anonymous_id_override: anonymousId
    })
    const data = {
      anonymousId: 'anonymous-id-override',
      name: context.page.name,
      properties: _properties,
      context: context,
      writeKey: WRITEKEY
    }
    const url = 'https://segment.heidian.io/v1/page'
    await API.post(url, data)
    this.trackGooglePage(context, anonymousId)
  }

  trackGooglePage(context, anonymousId) {
    const url = 'https://ga.heidian.io/collect'
    const params = {
      tid: 'UA-81143727-8',
      cid: anonymousId,
      t: 'pageview',
      dl: context.page.url,
      dt: context.page.title,
      ul: context.locale,
      v: 1
    }
    if (context.campaign) {
      params['cn'] = context.campaign['name'] || null
      params['cs'] = context.campaign['source'] || null
      params['cm'] = context.campaign['medium'] || null
      params['ck'] = context.campaign['term'] || null
      params['cc'] = context.campaign['content'] || null
    }
    API.get(url, { params })
  }
}

const analytics = new Analytics()

!(function () {
  return
  async function empty() {
    console.log(
      '开发环境下不发送 Analytics 数据, 如需测试请移除此代码',
      getPageContext()
    )
    await new Promise((resolve, reject) => resolve())
  }
  Taro.getSystemInfo({
    success: (info) => {
      if (info.brand == 'devtools' || info.platform == 'devtools') {
        analytics.page = analytics.track = analytics.identify = empty
      }
      CONTEXT.screen = {
        density: info.pixelRatio,
        height: info.screenHeight,
        width: info.screenWidth
      }
      CONTEXT.device = {
        // id: '',
        type: info.platform,
        manufacturer: info.brand,
        model: info.model
      }
    }
  })
})()

export default analytics
