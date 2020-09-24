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
        fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price', 'metafields'].join(',')
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
    list(context, options) {
      // 注意, 这个逻辑的存在, 使得更新 filter 等等失效了, 但是 infiniteProducts 现在不需要更新 filter 等
      const { state, commit } = context
      const { append } = options || {}
      const now = (new Date()).valueOf()
      if (!append && state.lastRefreshed && (now - state.lastRefreshed) < 30 * 1000) {
        console.log('wait to refresh', now - state.lastRefreshed)
        return Promise.resolve({
          count: state.count, data: []
        })
      } else if (!append && state.lastRefreshed && (now - state.lastRefreshed) >= 30 * 1000) {
        let page = state.page + 1
        if (page * state.pageSize > state.count) {
          page = 1
        }
        commit('setPage', page)
      }
      commit('setLastRefreshed', now)
      return actions.list.call(this, context, options)
    }
  }
}
