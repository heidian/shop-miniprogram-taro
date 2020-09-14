import _ from 'lodash'
import { API } from '@/utils/api'

const state = {
  uptoken: null
}

const mutations = {
  set_uptoken (state, payload) {
    state.uptoken = payload
  }
}

const actions = {
  getUploadToken (context, number) {
    const returnBody = '{"name":$(fname),"link":"https://up.img.heidiancdn.com/$(key)","key":$(key),"orientation":$(imageInfo.orientation),"imageAve":$(imageAve),"mimeType":$(mimeType),"ext":$(ext),"size":$(fsize),"width":$(imageInfo.width),"height":$(imageInfo.height)}'
    const policy = {
      saveKey: 'miniprogram/$(etag)${ext}',
      returnBody
    }
    return API.get(`/clients/qiniu-uptoken/heidianup/`, {
      params: {
        policy: JSON.stringify(policy)
      }
    }).then(({ data: { uptoken } }) => {
      context.commit('set_uptoken', uptoken)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
