import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

const UPLOAD_URL = 'https://up.qbox.me'
const RETURN_BODY = '{"name":$(fname),"url":"https://up.img.heidiancdn.com/$(key)","key":$(key),"orientation":$(imageInfo.orientation),"imageAve":$(imageAve),"mimeType":$(mimeType),"ext":$(ext),"size":$(fsize),"width":$(imageInfo.width),"height":$(imageInfo.height)}'
const SAVE_KEY = 'miniprogram/$(etag)${ext}'

const state = {
  uptoken: null
}

const mutations = {
  setUptoken (state, payload) {
    state.uptoken = payload
  }
}

const actions = {
  getUploadToken({ commit }, number) {
    const policy = {
      saveKey: SAVE_KEY,
      returnBody: RETURN_BODY
    }
    return API.get(`/clients/qiniu-uptoken/heidianup/`, {
      params: {
        policy: JSON.stringify(policy)
      }
    }).then(({ data: { uptoken } }) => {
      commit('setUptoken', uptoken)
    })
  },
  uploadImage({ state }, filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        reject(new Error('没有选择文件'))
      }
      if (!state.uptoken) {
        reject(new Error('请先获取 uptoken'))
      }
      Taro.uploadFile({
        url: UPLOAD_URL,
        filePath: filePath,
        name: 'file',
        formData: {
          'token': state.uptoken
        }
      }).then(res => {
        resolve(JSON.parse(res.data))
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
