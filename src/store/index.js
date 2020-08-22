import Vue from 'vue'
import Vuex from 'vuex'
import listStores from './lists/index'
import customerStore from './customer'

Vue.use(Vuex)

const state = {
  numbers: [1, 2, 3]
}

const mutations = {
  ADD_NUMBER(state, payload) {
    state.numbers.push(payload)
  }
}

const actions = {
  addNumber(context, number) {
    context.commit('ADD_NUMBER', number)
  }
}

const getters = {
  getNumbers(state) {
    return state.numbers
  }
}

export default new Vuex.Store({
  modules: {
    lists: listStores,
    customer: customerStore
  },
  state,
  mutations,
  actions,
  getters
})
