import Taro from '@tarojs/taro'

const UPLOAD_URL = 'https://up.qbox.me'

export const uploadImage = (filePath, uptoken) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('没有选择文件'))
    }
    if (!uptoken) {
      reject(new Error('请先获取 uptoken'))
    }
    Taro.uploadFile({
      url: UPLOAD_URL,
      filePath: filePath,
      name: 'file',
      formData: {
        'token': uptoken
      }
    }).then(res => {
      resolve(JSON.parse(res.data))
    }).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
