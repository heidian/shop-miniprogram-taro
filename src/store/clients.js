import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

const UPLOAD_URL = 'https://up.qbox.me'
// const RETURN_BODY = '{"name":$(fname),"url":"https://up.img.heidiancdn.com/$(key)","key":$(key),"orientation":$(imageInfo.orientation),"imageAve":$(imageAve),"mimeType":$(mimeType),"ext":$(ext),"size":$(fsize),"width":$(imageInfo.width),"height":$(imageInfo.height)}'
const RETURN_BODY = '{"url":"https://up.img.heidiancdn.com/$(key)","key":$(key),"orientation":$(imageInfo.orientation),"imageAve":$(imageAve),"mimeType":$(mimeType),"ext":$(ext),"size":$(fsize),"width":$(imageInfo.width),"height":$(imageInfo.height)}'
const SAVE_KEY = 'miniprogram/$(etag)${ext}'

const state = {
  _uptoken: null  // 不要在 store 的外部使用这个 _uptoken
}

const mutations = {
  setUptoken (state, payload) {
    state._uptoken = payload
  }
}

const actions = {
  async getUploadToken({ state, commit }) {
    if (state._uptoken) {
      return state._uptoken
    }
    const policy = JSON.stringify({ saveKey: SAVE_KEY, returnBody: RETURN_BODY })
    const { data } = await API.get(`/clients/qiniu-uptoken/heidianup/`, {
      params: { policy }
    })
    commit('setUptoken', data.uptoken)
    return data.uptoken
  },
  async uploadImage({ dispatch }, filePath) {
    const uptoken = await dispatch('getUploadToken')
    const data = await new Promise((resolve, reject) => {
      if (!filePath) { reject(new Error('没有选择文件')) }
      if (!uptoken) { reject(new Error('请先获取 uptoken')) }
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
    // 在这个方法里把 image object 处理好, 调用者就不需要关心 qiniu 返回的格式了
    const imageObject = {
      src: data.url,
      metafield: _.omit(data, ['url'])
    }
    return imageObject
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
