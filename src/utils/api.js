import Taro from '@tarojs/taro'
import combineURLs from './combineURLs'
import buildURL from './buildURL'
import store from '../store/index'

// config/dev.js 里面定义了 API_URL
const APIRoot = API_URL
const getAPIRoot = () => {
  return store.state.config.apiroot  // || APIRoot
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


const API = {
  post: (path, data = {}, options = {}) => {
    const params = options.params || {}
    const headers = options.headers || {}
    const url = combineURLs(getAPIRoot(), buildURL(path, params))
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
    const url = combineURLs(getAPIRoot(), buildURL(path, params))
    return Taro.request({
      url: url,
      method: 'GET',
      header: headers
    })
  },
  put: (path, data = {}, options = {}) => {
    const params = options.params || {}
    const headers = options.headers || {}
    const url = combineURLs(getAPIRoot(), buildURL(path, params))
    return Taro.request({
      url: url,
      data: data,
      method: 'PUT',
      header: headers
    })
  },
  handleErr: (err) => {
    Taro.hideLoading()
    if (err.response && (err.response.status == 403 || err.response.status == 401)) {
      Taro.showToast({
        icon: 'none',
        title: '请登录后继续操作'
      })
    } else if (err.response && err.response.data) {
      var errors = []
      for (var key in err.response.data) {
        var value = err.response.data[key]
        errors.push(value)
      }
      Taro.showModal({
        title: '出错了',
        content: errors.join(' '),
        showCancel: false,
        success: function(res) {}
      })
    } else {
      let err_msg = ''
      if (err && err.detail) {
        err_msg = err.detail
      } else if (err.errMsg) {
        err_msg = err.errMsg
      } else if (typeof err === 'object') {
        err_msg = JSON.stringify(err)
      } else {
        err_msg = err.toString()
      }
      Taro.showModal({
        title: '出错了',
        content: err_msg,
        showCancel: false,
        success: function(res) {}
      })
    }
  }
}

export {
  API
}
