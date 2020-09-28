import _ from 'lodash'
import Taro from '@tarojs/taro'

export const handleErr = (err) => {
  Taro.hideLoading()
  // Taro.hideLoading()  // 不应该写这个
  if (err.response && (err.response.status == 403 || err.response.status == 401)) {
    // 403 和 401 不要做任何操作, 有时候这种错误未必就是登录就能解决的
    // 界面上应该自己按需处理, 这里可以再 export 一个新的方法 "requireLogin" 来专门处理登录跳转
    // Taro.showToast({
    //   icon: 'none',
    //   title: '请登录后继续操作'
    // })
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
    console.log(err)  // 遇到未知错误, 都打印出来, 好后期检查错误栈
    let errMsg = ''
    if (err instanceof Error) {
      errMsg = err.detail || err.errMsg || ('' + err)
    } else if (_.isPlainObject(err) || _.isArray(err)) {
      errMsg = JSON.stringify(err)
    } else {
      errMsg = '' + err
    }
    Taro.showModal({
      title: '出错了',
      content: errMsg,
      showCancel: false,
      success: function(res) {}
    })
  }
}
