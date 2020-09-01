import Taro from '@tarojs/taro'
import _ from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'
import { API } from '@/utils/api'

function filterValueToString(value, type) {
  if (_.isNil(value) || value === '') {
    return ''
  }
  if (type === 'ISO') {
    return moment(value).toISOString()
  } else if (type === 'ISO-CSV' && _.isArray(value)) {
    return _.map(value, (v) => filterValueToString(v, 'ISO')).join(',')
  } else if (type === 'CSV' && _.isArray(value)) {
    return _.map(value, (v) => filterValueToString(v, '')).join(',')
  } else {
    return value.toString()
  }
}

function stringToFilterValue(value, type) {
  if (_.isNil(value) || value === '') {
    return ''
  }
  // filter 里面存着的值一定得是字符串, 所以这里强制 toString()
  value = value.toString()
  if (type === 'ISO') {
    return moment(value).toDate()
  } else if (type === 'ISO-CSV') {
    return _.map(value.split(','), (v) => stringToFilterValue(v, 'ISO'))
  } else if (type === 'CSV') {
    return _.map(value.split(','), (v) => stringToFilterValue(v, ''))
  } else {
    return value
  }
}

function StoreListTable(propertyName, storeName) {
  return {
    computed: {
      ...mapState(`${storeName}`, {
        [propertyName]: (state) => state
      })
    },
    methods: {
      async updatePage(page, { fetch = true } = {}) {
        this.$store.commit(`${storeName}/setPage`, page)
        if (fetch) {
          await this.fetchList()
        }
      },
      async updatePageSize(pageSize, { fetch = true } = {}) {
        this.$store.commit(`${storeName}/setPageSize`, pageSize)
        if (fetch) {
          await this.fetchList()
        }
      },
      async updateOrderBy(orderBy, { fetch = true } = {}) {
        this.$store.commit(`${storeName}/setOrderBy`, orderBy)
        if (fetch) {
          await this.fetchList()
        }
      },
      getFilter(name, type) {
        const value = _.get(this[propertyName].filter, name)
        return stringToFilterValue(value, type)
      },
      async updateFilter(filter, { partial = true, fetch = true } = {}) {
        const page = 1  // 修改 filter 以后重置 page
        filter = _.toPairs(filter)
        filter = _.map(filter, ([name, _value]) => {
          if (_.isPlainObject(_value) && _.has(_value, 'value') && _.has(_value, 'type')) {
            const { value, type } = _value
            return [name, filterValueToString(value, type)]
          } else {
            const value = _value
            return [name, filterValueToString(value, '')]
          }
        })
        filter = _.fromPairs(filter)
        if (partial) {
          filter = { ...this[propertyName].filter, ...filter }
        }
        this.$store.commit(`${storeName}/setFilter`, filter)
        this.$store.commit(`${storeName}/setPage`, page)
        if (fetch) {
          await this.fetchList()
        }
      },
      async fetchMore() {
        const { count, pending, page, pageSize } = this[propertyName]
        if (pending || page * pageSize >= count) {
          // 正在加载或者没有更多数据了, 就停止; 初始条件下 page, pageSize, count 都是 0, 这个条件也满足
          return { count, data: [] }
        }
        this.$store.commit(`${storeName}/setPage`, page + 1)
        await this.fetchList({ append: true })
      },
      async fetchList({ append = false } = {}) {
        try {
          await this.$store.dispatch(`${storeName}/list`, { append })
        } catch(error) {
          const message = _.get(error, 'response.data.detail', '列表参数错误') + ''
          Taro.showToast({ title: message, icon: 'none', duration: 2000 })
        }
      },
      async createOne(data) {
        // 创建的错误交给调用者去处理
        const res = await this.$store.dispatch(`${storeName}/create`, { data })
        Taro.showToast({ title: '创建成功!', icon: 'success', duration: 2000 })
        await this.fetchList()
        return res
      },
      async removeOne(id, { message = '确定删除?' } = {}) {
        // TODO 这个方法现在有点问题, 需要把 showModal 后面的代码放进 success 里面
        // Taro.showModal({
        //   title: '提示',
        //   content: message,
        //   success: (res) => {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //     } else if (res.cancel) {
        //       //
        //     }
        //   }
        // })
        // try {
        //   await this.$store.dispatch(`${storeName}/remove`, { id })
        // } catch(error) {
        //   const message = _.get(error, 'response.data.detail', '无法删除') + ''
        //   Taro.showToast({ title: message, icon: 'none', duration: 2000 })
        //   return
        // }
        // Taro.showToast({ title: '删除成功!', icon: 'success', duration: 2000 })
        // await this.fetchList()
      }
    }
  }
}

function LocalListTable(propertyName, urlRoot) {
  return {
    data() {
      return {
        [propertyName]: {
          filter: {},
          orderBy: null,
          page: 1,
          pageSize: 10,
          count: 0,
          data: [],
          error: {},
          pending: false
        }
      }
    },
    methods: {
      async updatePage(page, { fetch = true } = {}) {
        this[propertyName].page = page || 1
        if (fetch) {
          await this.fetchList()
        }
      },
      async updatePageSize(pageSize, { fetch = true } = {}) {
        this[propertyName].pageSize = pageSize || 10
        if (fetch) {
          await this.fetchList()
        }
      },
      async updateOrderBy(orderBy, { fetch = true } = {}) {
        this[propertyName].orderBy = orderBy || null
        if (fetch) {
          await this.fetchList()
        }
      },
      getFilter(name, type) {
        const value = _.get(this[propertyName].filter, name)
        return stringToFilterValue(value, type)
      },
      async updateFilter(filter, { partial = true, fetch = true } = {}) {
        const page = 1  // 修改 filter 以后重置 page
        filter = _.toPairs(filter)
        filter = _.map(filter, ([name, _value]) => {
          if (_.isPlainObject(_value) && _.has(_value, 'value') && _.has(_value, 'type')) {
            const { value, type } = _value
            return [name, filterValueToString(value, type)]
          } else {
            const value = _value
            return [name, filterValueToString(value, '')]
          }
        })
        filter = _.fromPairs(filter)
        if (partial) {
          filter = { ...this[propertyName].filter, ...filter }
        }
        this[propertyName] = {
          ...this[propertyName],
          filter: _.cloneDeep(filter || {}),
          page: page || 1
        }
        if (fetch) {
          await this.fetchList()
        }
      },
      async fetchMore() {
        const { count, pending, page, pageSize } = this[propertyName]
        if (pending || page * pageSize >= count) {
          // 正在加载或者没有更多数据了, 就停止; 初始条件下 page, pageSize, count 都是 0, 这个条件也满足
          return { count, data: [] }
        }
        this[propertyName].page = page + 1
        await this.fetchList({ append: true })
      },
      async fetchList({ append = false } = {}) {
        try {
          this[propertyName].pending = true
          this[propertyName].error = {}
          const { filter, page, pageSize, orderBy } = this[propertyName]
          const { data } = await API.get(urlRoot, {
            params: {
              ...filter,
              page,
              page_size: pageSize,
              order_by: orderBy
            }
          })
          const payload = _.isArray(data)? {
            count: data.length,
            data
          } : {
            count: data.count,
            data: data.results
          }
          this[propertyName] = {
            ...this[propertyName],
            count: payload.count,
            data: append ? [ ...this[propertyName].data, ...payload.data ] : payload.data,
            pending: false,
            error: {}
          }
          return payload  // 只 return 本次请求取的数据
        } catch(error) {
          const errorData = _.get(error, 'response.data')
          this[propertyName].pending = false
          this[propertyName].error = _.cloneDeep(errorData || {})
          const message = _.get(error, 'response.data.detail', '列表参数错误' + error) + ''
          Taro.showToast({ title: message, icon: 'none', duration: 2000 })
        }
      },
      async createOne(data) {
        this[propertyName].pending = true
        let res
        try {
          res = await API.post(urlRoot, { data })
          this[propertyName].pending = false
        } catch(error) {
          this[propertyName].pending = false
          throw error
          // 创建的错误交给调用者去处理
        }
        Taro.showToast({ title: '创建成功!', icon: 'success', duration: 2000 })
        await this.fetchList()
        return res
      },
      async removeOne(id, { message = '确定删除?' } = {}) {
        // TODO 这个方法现在有点问题, 需要把 showModal 后面的代码放进 success 里面
        // Taro.showModal({
        //   title: '提示',
        //   content: message,
        //   success: (res) => {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //     } else if (res.cancel) {
        //       //
        //     }
        //   }
        // })
        // this[propertyName].pending = true
        // try {
        //   await this.$store.dispatch(`${storeName}/remove`, { id })
        //   this[propertyName].pending = false
        // } catch(error) {
        //   const message = _.get(error, 'response.data.detail', '无法删除') + ''
        //   this[propertyName].pending = false
        //   Taro.showToast({ title: message, icon: 'none', duration: 2000 })
        //   return
        // }
        // Taro.showToast({ title: '删除成功!', icon: 'success', duration: 2000 })
        // await this.fetchList()
      }
    }
  }
}

export default (propertyName, { storeName, urlRoot } = {}) => {
  if (!!storeName == !!urlRoot) {
    throw new Error('storeName 和 urlRoot 至少设置一个且只能设置一个')
  }
  if (storeName) {
    return StoreListTable(propertyName, storeName)
  } else {
    return LocalListTable(propertyName, urlRoot)
  }
}
