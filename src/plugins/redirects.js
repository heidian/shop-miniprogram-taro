import qs from 'qs'
import Taro from '@tarojs/taro'

/*
 * 处理旧的路由, 重定向到新的路由
 */
if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
  Taro.onPageNotFound(function({ isEntryPage, path, query }) {
    console.log('PageNotFound', isEntryPage, path, query)
    if (/^pages\/(product|static|search)$/.test(path)) {
      Taro.redirectTo({ url: path + '/index?' + qs.stringify(query) })
    } else if (/^pages\/login$/.test(path)) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else if (/^pages\/(account|categories)$/.test(path)) {
      Taro.switchTab({ url: '/pages/login/index' })
    }
    // else if (/^pages\/home$/.test(path)) {
    //   Taro.switchTab({ url: '/pages/home/index' })
    // }
  })
}
