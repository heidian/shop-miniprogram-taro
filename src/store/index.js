import Vue from 'vue'
import Vuex from 'vuex'
import Taro from '@tarojs/taro'

import listStores from './lists/index'
import customerStore from './customer'
import exampleStore from './example'

Vue.use(Vuex)

const extConfig = Taro.getExtConfigSync()

const state = () => {
  const { extAppid, apiroot, shopname, shopid } = extConfig
  return {
    config: {
      appid: extAppid,
      apiroot,
      shopname,
      shopid
    }
  }
}

const mutations = {}
const actions = {}
const getters = {}

export default new Vuex.Store({
  modules: {
    lists: listStores,
    customer: customerStore,
    example: exampleStore
  },
  state,
  mutations,
  actions,
  getters
})
