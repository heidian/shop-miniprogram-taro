import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import CustomNav from './CustomNav'
import ProductItem from './ProductItem'
import SearchFilters from './SearchFilters'
import FloatingButtons from '@/components/FloatingButtons/FloatingButtons'

import ListTable from '@/mixins/ListTable'
// const listTableMixin = ListTable('products', { urlRoot: '/shopfront/product/' })

export default {
  name: 'Search',
  mixins: [
    // 这个 mixin 会定义一个叫 products 的 computed 对象
    ListTable('products', { storeName: 'lists/products' })
  ],
  components: {
    CustomNav,
    SearchFilters,
    ProductItem,
    FloatingButtons,
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['categories', 'system']),
    customNavHeight() {
      return this.system.statusBarHeight + 44
      // return 0
    },
    pagePaddingTop() {
      return Taro.pxTransform(this.customNavHeight + 35)
    },
    hasMore() {
      return this.products.data.length < this.products.count
    }
  },
  created() {},
  async mounted() {
    // 初始化过滤参数
    const defaultParams = {
      'fields': [
        'id', 'name', 'title', 'description', 'published_at',
        'image', 'price', 'compare_at_price', 'options', // 'variants',
      ].join(','),
      // 'fields[variants]': ['id', 'options'].join(','),
    }
    const filter = {}
    const { category } = getCurrentInstance().router.params
    filter.category = category
    // 因为要处理 activeCategory, 这里先 await 一下, categories 全局只取一次, 这样问题不大
    await this.$store.dispatch('categories/list')
    // 去掉这个默认分类的处理
    // if (!filter.category) {
    //   // 默认一定要选中一个分类, 这个版本 search 页面不能显示全部商品, 之后再支持更多过滤
    //   filter.category = this.categories.data[0].id
    // }
    this.$store.commit('lists/products/setParams', { filter, defaultParams })
    this.fetchProducts()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    goToProduct(productName) {
      /* 没有特别原因不要用 wx 的方法, 全部用 Taro 上的方法 */
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    },
    async fetchProducts({ more = false } = {}) {
      // fetchList 和 fetchMore 统一在这里调用, 因为调用前后还要处理各种 UI 元素
      // Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        await this.fetchList()
      }
      // Taro.hideNavigationBarLoading()
    },
    onSubmitSearch(q) {
      // 因为有 partial: false, 这里其实不需要专门把其他过滤参数重置为空
      this.updateFilter({ q }, { partial: false, fetch: true })
      // this.fetchProducts()
    },
  },
  async onPullDownRefresh() {
    await this.fetchProducts()
    Taro.stopPullDownRefresh()
  },
  async onReachBottom() {
    if (this.hasMore) {
      await this.fetchProducts({ more: true })
    }
  },
  onPageScroll(e) {
    this.$refs['searchFilters'].handlePageScroll(e.scrollTop)
  }
}
