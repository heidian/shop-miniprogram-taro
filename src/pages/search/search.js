import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import CustomNav from './CustomNav'
import ProductItem from './ProductItem'
import ProductPreview from './ProductPreview'
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
    ProductPreview,
    FloatingButtons,
  },
  data() {
    return {
      currentProduct: {},
      currentVariant: {},
      previewVisible: false
    }
  },
  computed: {
    ...mapState(['categories', 'system']),
    customNavHeight() {
      // return this.system.statusBarHeight + 44
      return 0
    },
    pagePaddingTop() {
      // searchInput 高度是 40, categoriesBar 高度是 35
      return Taro.pxTransform(this.customNavHeight + 40 + 35)
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
    const { category = '', tag = '' } = getCurrentInstance().router.params
    filter.category__in = decodeURIComponent(category)
    filter.tag__in = decodeURIComponent(tag)
    // 因为要处理 activeCategory, 这里先 await 一下, categories 全局只取一次, 这样问题不大
    await this.$store.dispatch('categories/list')
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
    // onSubmitSearch(q) {
    //   // 因为有 partial: false, 这里其实不需要专门把其他过滤参数重置为空
    //   this.updateFilter({ q }, { partial: false, fetch: true })
    //   // this.fetchProducts()
    // },
    async onPreview(productId) {
      // 预览商品，获取商品data，作为传入子组件的属性
      if (!productId) return;
      if (+productId !== this.currentProduct.id) {
        Taro.showLoading({})
        const { data: currentProduct } = await API.get(`/shopfront/product/${productId}/`, { params: { fields: 'id,title,images,variants,options' }})
        const currentVariant = _.find(currentProduct.variants || [], { is_available: true }) || currentProduct.variants[0]
        this.currentProduct = currentProduct
        this.currentVariant = currentVariant
        Taro.hideLoading()
        this.previewVisible = true
      }
    },
    handleClosePreview() {
      this.currentProduct = {}
      this.currentVariant = {}
    }
  },
  watch: {
    'products.pending': {
      handler: function(navVal, oldVal) {
        if (navVal) {
          Taro.showNavigationBarLoading()
        } else {
          Taro.hideNavigationBarLoading()
        }
      }
    }
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
