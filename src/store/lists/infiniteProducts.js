import _ from 'lodash'
import moment from 'moment'
import ListStore from '../factory/List'
// export default ListStore('/shopfront/product/')
// InfiniteProducts 板块专用, 所有地方的 InfiniteProducts 显示的内容是一样的, 但是这个板块内部自己有一些刷新的逻辑

const { state, getters, mutations, actions } = ListStore('/shopfront/product/')

export default {
  namespaced: true,
  state () {
    return {
      ...state(),
      defaultParams: {
        fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price'].join(',')
      },
      lastRefreshed: null
    }
  },
  getters: {
    ...getters
  },
  mutations: {
    ...mutations,
    setLastRefreshed(state, payload) {
      state.lastRefreshed = payload
    }
  },
  actions: {
    ...actions,
    refreshList({ state, commit, dispatch }) {
      // refreshList 是给 infiniteProducts 板块出现在用户面前时候刷新用, 用来取消首页加上的 filter,
      // 除非首页人工点了分类过滤过 (会重置 lastRefreshed), 不然这个方法不会频繁取数据
      commit('setFilter', {})
      const now = (new Date()).valueOf()
      if (state.lastRefreshed && (now - state.lastRefreshed) < 30 * 1000) {
        // console.log('wait to refresh', now - state.lastRefreshed)
        return Promise.resolve({
          count: state.count, data: []
        })
      } else if (state.lastRefreshed && (now - state.lastRefreshed) >= 30 * 1000) {
        let page = state.page + 1
        if (page * state.pageSize > state.count) {
          page = 1
        }
        commit('setPage', page)
      }
      commit('setLastRefreshed', now)
      return dispatch('list')
    },
    listMore({ state, commit, dispatch }) {
      const { count, pending, page, pageSize, data } = state
      if (pending || page * pageSize >= count || data.length >= 30 ) {
        // 正在加载或者没有更多数据了, 就停止; 初始条件下 page, pageSize, count 都是 0, 这个条件也满足
        return { count, data: [] }
      }
      commit('setPage', page + 1)
      return dispatch('list', { append: true })
    }
  }
}
