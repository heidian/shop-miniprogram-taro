import _ from 'lodash'
import Taro from '@tarojs/taro'

export default function(scene) {
  /*
   * 新版 scene 的格式是 r=product&s=offline&c=MuTYx&id=123
   * 表示 来源是 offline, redirect 到 product 页面, 页面参数是 ?id=123
   * 命令参数是:
   * r 跳转 redirect
   * us/s 来源 utm_source
   * um/m 来源 utm_medium
   * uc 来源 utm_content
   * c 推荐码 referral_code
   * p 弹框 popup
   * 除了 r|redirect|s|us|utm_source|m|um|utm_medium|uc|utm_content|c|referral_code 以外都是自定义参数
   */
  const parsedSceneObj = {}
  if (typeof scene !== 'string' || !/[^=]+=[^=]+(&[^=]+=[^=]+)*/.test(scene)) {
    return parsedSceneObj
  }
  const kvs = scene.split('&')
  const query = _.fromPairs(_.map(_.compact(kvs), item => item.split('=')))
  const utm_source = query.utm_source || query.us || query.s || ''
  const utm_medium = query.utm_medium || query.um || query.m || ''
  const utm_content = query.utm_content || query.uc || ''
  if (utm_source) {
    parsedSceneObj['campaignContext'] = {
      source: utm_source,
      medium: utm_medium || 'referral',  // 如果有 utm_source 则默认 medium 为 referral
      content: utm_content
    }
  }
  const referralCode = query.referral_code || query.c
  if (referralCode) {
    parsedSceneObj['referralCode'] = referralCode
  }
  const redirect = query.redirect || query.r
  const popup = query.popup || query.p
  if (popup) {
    // TODO: popup 的功能需要实现, 可以实现进入首页就弹出一个指定券号的优惠券
  }
  if (redirect) {
    const _page = redirect
    const shortNames = {
      'pdt': 'product/index', 'clt': 'collection/index',
      'vdr': 'vendor/index', 'cpn': 'coupon/redeem'
    }
    const oldToNew = {
      'product': 'product/index', 'collection': 'collection/index',
      'vendor': 'vendor/index', 'coupon_redeem': 'coupon/redeem'
    }
    // 'rfl': 'referral', 'ltr': 'lottery'
    const page = shortNames[_page] || oldToNew[_page] || _page
    const ignore = ['r', 'redirect',
                    's', 'us' ,'utm_source',
                    'm', 'um', 'utm_medium',
                    'uc', 'utm_content',
                    'c', 'referral_code',
                    'p', 'popup']
    const queryTuples = _.toPairs(_.omit(query, ignore))
    const search = _.map(queryTuples, ([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    // page 不能是一个 tabbar, switchTab 无法带 url 参数, 要打开 tab 就直接生成对应 tab 的小程序码
    parsedSceneObj['redirect'] = `/pages/${page}?${search}`
    if (referralCode && page === 'product/index' && query.id) {
      // 有 referralCode 就跳转 share-landing
      parsedSceneObj['redirect'] = `/pages/misc/share-landing?code=${referralCode}&product=${query.id}`
    }
  } else {
    // 有 referralCode 就跳转 share-landing
    if (referralCode) {
      parsedSceneObj['redirect'] = `/pages/misc/share-landing?code=${referralCode}`
    }
  }
  return parsedSceneObj
}
