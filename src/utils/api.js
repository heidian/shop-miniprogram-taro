import Taro from '@tarojs/taro'
import combineURLs from './combineURLs'
import buildURL from './buildURL'

// config/dev.js 里面定义了 API_URL
const APIRoot = API_URL
const DefaultHeaders = {
  'X-Shop': SHOP_NAME,
  'Accept-Language': 'zh'
}

const interceptor = async function (chain) {
  const requestParams = chain.requestParams
  requestParams.header = {
    ...requestParams.header,
    ...DefaultHeaders
  }
  try {
    // getStorage 找不到 key 会抛出异常, 这个片段的单独 try catch
    const { data: token } = await Taro.getStorage({ key: 'customertoken' })
    const { header } = requestParams
    header['Authorization'] = `CustomerToken ${token}`
  } catch (e) {}
  return chain.proceed(requestParams).then((response) => {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response
    } else {
      const error = new Error('Request Error')
      error.response = response
      throw error
    }
  })
}
Taro.addInterceptor(interceptor)


const API = {
  post: (path, data = {}, options = {}) => {
    const params = options.params || {}
    const headers = options.headers || {}
    const url = combineURLs(APIRoot, buildURL(path, params))
    return Taro.request({
      url: url,
      data: data,
      method: 'POST',
      header: headers
    })
  },
  get: (path, options = {}) => {
    const params = options.params || {}
    const headers = options.headers || {}
    const url = combineURLs(APIRoot, buildURL(path, params))
    return Taro.request({
      url: url,
      method: 'GET',
      header: headers
    })
  }
}

export {
  API
}
