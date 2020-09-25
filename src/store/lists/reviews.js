import _ from 'lodash'
import { API } from '@/utils/api'

import ListStore from '../factory/List'
// export default ListStore('/shopfront/review/')

const { state, getters, mutations, actions } = ListStore('/shopfront/review/')

export default {
  namespaced: true,
  state () {
    return {
      ...state(),
      reviewTotalCount: 0,
      firstReviewPending: false,
      firstReviewData: {}
    }
  },
  getters: {
    ...getters
  },
  mutations: {
    ...mutations,
    resetFirstReview (state) {
      state.reviewTotalCount = 0
      state.firstReviewPending = false
      state.firstReviewData = {}
    },
    startFetchFirstReview (state) {
      state.firstReviewPending = true
    },
    setFirstReview (state, { count, results }) {
      state.reviewTotalCount = count || 0
      state.firstReviewData = _.head(results) || {}
      state.firstReviewPending = false
    }
  },
  actions: {
    ...actions,
    getFirstReview ({ state, commit }, productId) {
      if (!!state.firstReviewPending) return
      commit('startFetchFirstReview')
      const params = {
        product: productId,
        page_size: 1,
        page: 1
      }
      API.get(`/shopfront/review/`, { params }).then((res) => {
        commit('setFirstReview', res.data || {})
      }).catch(err => {})
    }
  }
}

