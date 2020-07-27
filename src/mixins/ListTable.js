import _ from 'lodash'
import moment from 'moment'
import { mapState } from 'vuex'

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

export default (propertyName, { storeName, urlRoot } = {}) => {
  if (!!storeName == !!urlRoot) {
    throw new Error('storeName 和 urlRoot 至少设置一个且只能设置一个')
  }
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
        filter = _.chain(filter).toPairs().map(([name, _value]) => {
          if (_.isPlainObject(_value) && _.has(_value, 'value') && _.has(_value, 'type')) {
            const { value, type } = _value
            return [name, filterValueToString(value, type)]
          } else {
            const value = _value
            return [name, filterValueToString(value, '')]
          }
        }).fromPairs().value()
        if (partial) {
          filter = { ...this[propertyName].filter, ...filter }
        }
        this.$store.commit(`${storeName}/setFilter`, filter)
        this.$store.commit(`${storeName}/setPage`, page)
        if (fetch) {
          await this.fetchList()
        }
      },
      async fetchList() {
        try {
          await this.$store.dispatch(`${storeName}/list`)
        } catch(error) {
          const message = _.get(error, 'response.data', '列表参数错误')
          this.$message({ type: 'error', message })
        }
      },
      async removeOne(id, { message = '确定删除?' } = {}) {
        const confirm = await this.$confirm(message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => {})
        if (!confirm) {
          return
        }
        try {
          await this.$store.dispatch(`${storeName}/remove`, { id })
        } catch(error) {
          const message = _.get(error, 'response.data.detail', '无法删除')
          this.$message({ type: 'error', message })
          return
        }
        this.$message({ type: 'success', message: '删除成功!' })
        await this.fetchList()
      }
    }
  }
}
