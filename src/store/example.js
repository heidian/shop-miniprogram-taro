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

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
