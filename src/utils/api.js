import _ from 'lodash'
import qs from 'qs'
import Taro from '@tarojs/taro'
import store from '../store/index'

const getAPIRoot = () => {
  return store.state.config.apiroot
}

const getDefaultHeaders = () => {
  return {
    'X-Shop': store.state.config.shopname,
    'Accept-Language': 'zh',
    'Content-Type': 'application/json',
    // H5 版本的 Taro.request 如果不设置 Content-Type 默认是 text, 这样 post 请求的 json 数据就会被 stringify
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
  try {
    const response = await chain.proceed(requestParams)
    // 这里改成和 axios 类似的格式, { status, data, headers }
    const { statusCode, data, header } = response
    if (statusCode >= 200 && statusCode < 300) {
      return { data, status: statusCode, headers: header }
    } else {
      const error = new Error('Request Error')
      error.response = { data, status: statusCode, headers: header }
      throw error
    }
  } catch(response) {
    if (response instanceof Error) {
      throw response
    // } else if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
    } else if (typeof Response !== 'undefined' && response instanceof Response) {
      // 网页版的 response 比较特殊, 单独处理, 应该是用了这个 https://developer.mozilla.org/zh-CN/docs/Web/API/Response
      const status = response.status
      const data = await response.json()
      const headers = {}
      response.headers.forEach((v, k) => headers[k] = v)
      const error = new Error('Request Error')
      error.response = { data, status, headers }
      throw error
    } else {
      throw new Error('Unexpected Request Error')
    }
  }
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
  const searchString = qs.stringify(searchQuery, { arrayFormat: 'repeat' })
  if (searchString) {
    return fullURL + (fullURL.indexOf('?') === -1 ? '?' : '&') + searchString
  } else {
    return fullURL
  }
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
