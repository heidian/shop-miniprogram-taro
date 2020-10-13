import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'

const callForActivation = _.once(function() {
  // const currentPage = _.last(getCurrentPages())
  // if (/^pages\/partner/.test(_.get(currentPage, 'route'))) {
  //   return
  // }
  const now = (new Date()).valueOf()
  const muteCallForActivation = Taro.getStorageSync('muteCallForActivation')
  const muteDuration = 7 * 86400 * 1000
  if (muteCallForActivation && now - muteCallForActivation < muteDuration) {
    return
  } else if (muteCallForActivation) {
    Taro.removeStorageSync('muteCallForActivation')
  }
  Taro.showModal({
    title: '激活国货大使身份',
    content: '您已达到国货大使申请条件, 请前往会员页面免费激活国货大使身份',
    showCancel: true,
    cancelText: '不再提醒',
    cancelColor: '#aaaaaa',
    confirmText: '立即前往',
    confirmColor: '#ff5a00',
    success: function (res) {
      if (res.confirm) {
        Taro.switchTab({ url: '/pages/partner/index' })
      } else if (res.cancel) {
        Taro.setStorageSync('muteCallForActivation', (new Date()).valueOf())
      }
    }
  })
})

const state = () => {
  return {
    data: {}
  }
}

const getters = {}

const mutations = {
  setData(state, payload = {}) {
    _.forEach(['data'], field => {
      if (typeof payload[field] !== 'undefined') {
        state[field] = payload[field]
      }
    })
  }
}

const actions = {
  retrieve({ rootState, commit }) {
    return API.get('/substores/partners/profile/').then(({ data }) => {
      commit('setData', { data: data })
      if (data.growth_value >= 1000 && !data.level) {
        setTimeout(() => callForActivation(), 500)
      }
      return data
    }).catch((err) => {
      console.log('获取国货大使信息失败', _.get(err, 'response.data'))
      throw err
    })
  },
  update({ commit }, payload = {}) {
    return API.put('/substores/partners/profile/', payload).then(({ data }) => {
      commit('setData', { data: data })
      return data
    }).catch((err) => {
      console.log('更新国货大使信息失败', _.get(err, 'response.data'))
      throw err
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
