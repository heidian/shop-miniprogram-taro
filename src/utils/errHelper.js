const handleErr = (err) => {
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
export {
  handleErr
}