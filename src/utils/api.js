import qs from 'qs'
import Taro from '@tarojs/taro'
import store from '../store/index'

const getAPIRoot = () => {
  return store.state.config.apiroot
}

const getDefaultHeaders = () => {
  return {
    'X-Shop': store.state.config.shopname,
    'Accept-Language': 'zh'
  }
}

const interceptor = async function (chain) {
  const requestParams = chain.requestParams
  requestParams.header = {
    ...requestParams.header,
    ...getDefaultHeaders()
  }
  try {
    // getStorage 找不到 key 会抛出异常, 这个片段的单独 try catch
    const { header } = requestParams
    // const { data: token } = await Taro.getStorage({ key: 'customertoken' })
    const token = store.state.customer.customerToken
    if (typeof header['Authorization'] === 'undefined' && token) {
      header['Authorization'] = `CustomerToken ${token}`
    }
  } catch (e) {}
  return chain.proceed(requestParams).then((response) => {
    // 这里改成和 axios 类似的格式, { status, data, headers }
    const { statusCode, data, header } = response
    if (statusCode >= 200 && statusCode < 300) {
      return { data, status: statusCode, headers: header }
    } else {
      const error = new Error('Request Error')
      error.response = { data, status: statusCode, headers: header }
      throw error
    }
  })
}
Taro.addInterceptor(interceptor)

function combineURLs(baseURL, relativeURL, searchQuery) {
  if (/^(http|https):\/\/.+/.test(relativeURL)) {
    baseURL = relativeURL
    relativeURL = ''
  }
  const fullURL = relativeURL ?
    baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') :
    baseURL
  return fullURL + (fullURL.indexOf('?') === -1 ? '?' : '&') + qs.stringify(searchQuery)
}

const API = {
  post: (path, data = {}, options = {}) => {
    const params = options.params || {}
    const headers = options.headers || {}
    const url = combineURLs(getAPIRoot(), path, params)
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
    const url = combineURLs(getAPIRoot(), path, params)
    return Taro.request({
      url: url,
      method: 'GET',
      header: headers
    })
  },
  put: (path, data = {}, options = {}) => {
    const params = options.params || {}
    const headers = options.headers || {}
    const url = combineURLs(getAPIRoot(), path, params)
    return Taro.request({
      url: url,
      data: data,
      method: 'PUT',
      header: headers
    })
  },
  delete: (path, options = {}) => {
    const params = options.params || {}
    const headers = options.headers || {}
    const url = combineURLs(getAPIRoot(), path, params)
    return Taro.request({
      url: url,
      method: 'DELETE',
      header: headers
    })
  }
}

export {
  API
}
