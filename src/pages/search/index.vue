<template>
  <view
    :class="$style['page']"
    :style="{'paddingTop': pagePaddingTop, ...$globalColors}"
  >

    <custom-nav
      :q="products.filter.q"
      @submit="onSubmitSearch"
    ></custom-nav>

    <search-filters
      :products="products"
      @updateFilter="(filters) => updateFilter(filters, { partial: false, fetch: true })"
      @updateOrderBy="(orderBy) => updateOrderBy(orderBy, { fetch: true })"
    ></search-filters>

    <view
      v-if="activeRootCategoryImage"
      :class="$style['categoryImage']"
      :style="{'backgroundImage': backgroundImageUrl(activeRootCategoryImage, 400)}"
    ></view>
    <view :class="$style['productGrids']">
      <view v-for="(product, index) in products.data" :key="product.id" :class="$style['gridWrapper']">
        <view :class="$style['productItem']" @tap="goToProduct(product.name)">
          <view :class="$style['imageWrapper']">
            <image
              :class="$style['image']" mode="aspectFill" :lazy-load="true"
              :src="optimizeImage(product.image, 200)"
            ></image>
          </view>
          <view :class="$style['textWrapper']">
            <view :class="$style['title']">{{ product.title }}</view>
            <view :class="$style['description']">{{ product.description }}</view>
            <price
              :class="$style['price']" :highlight="true" :keepZero="true"
              :price="product.price" :compareAtPrice="product.compare_at_price"
            ></price>
          </view>
          <view :class="$style['colorOptionsWrapper']">
            <image
              v-for="item in getProductColorOptions(product)" :key="item.name"
              :class="$style['colorOptionsItem']"
              mode="aspectFill" :lazy-load="true"
              :src="optimizeImage(item.image, 40)"
            ></image>
          </view>
        </view>
      </view>
    </view>
    <!-- end product grids -->
    <!-- TODO 加一个 loading/more 的状态 -->
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'
import CustomNav from './CustomNav'
import SearchFilters from './SearchFilters'

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
    Price,
  },
  data() {
    return {
      colorNameToImage: {},
    }
  },
  created() {},
  computed: {
    ...mapState(['categories', 'system']),
    ...mapGetters('categories', [
      'getRootCategoryId'
    ]),
    customNavHeight() {
      return this.system.statusBarHeight + 44
    },
    pagePaddingTop() {
      return Taro.pxTransform(this.customNavHeight + 35)
    },
    activeRootCategoryImage() {
      const activeRootCategoryId = this.getRootCategoryId(this.products.filter.category)
      const category = _.find(this.categories.data, { id: activeRootCategoryId })
      return _.get(category, 'image.src') ? category.image : null
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
        'id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price', 'options', // 'variants',
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
      // 因为有 partial: false, 这里其实不需要专门把 category 重置为空, 为了避免混淆, 现在先这么保留着
      this.updateFilter({ q, category: '' }, { partial: false, fetch: false })
      this.fetchProducts()
    },
    getProductColorOptions(product) {
      const colorOptionTitle = _.get(this.$store.state.theme, 'themeSettingsData.colorOptionTitle.value') || ''
      const option = _.find(product.options, { title: colorOptionTitle }) || []
      if (!option) {
        return []
      }
      const results = _.map(option.values, (colorName) => {
        let image = this.colorNameToImage[colorName]
        if (!image) {
          const colorOptionImages = _.get(this.$store.state.theme, 'themeSettingsData.colorOptionImages') || []
          const item = _.find(colorOptionImages, (item) => _.get(item, 'metafield.altText') === colorName)
          if (item) {
            image = { src: item.src }
          }
        }
        return { name: colorName, image }
      })
      return _.filter(results, (item) => !!item.image)
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
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.page {
  // padding-top: 35px + 40px;  // inline 动态定义
  min-height: 100vh;
  overflow: hidden;
  background-color: $color-bg-gray;
}
.categoryImage {
  display: block;
  margin: 8px;
  padding-top: 33.333333%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 4px;
}
.productGrids {
  @include clearfix();
  padding: 5px;
}
.gridWrapper {
  float: left;
  width: 50%;
  padding: 5px;
  &:nth-child(2n+1) {
    clear: both;
  }
}
.productItem {
  width: 100%;
  border-radius: 5px;
  // box-shadow: 0 3px 5px rgba(#000, 0.2);
  background-color: #fff;
  overflow: hidden;
  .textWrapper {
    padding: 7px;
  }
  .title, .description {
    font-size: 12px;
    line-height: 15px;
    height: 30px;
    letter-spacing: 1px;
    word-break: break-all;
    @include ellipsis(2);
    margin-bottom: 5px;
  }
  .title {
    font-weight: 500;
    color: $color-text;
  }
  .description {
    color: $color-text-light;
  }
  .imageWrapper {
    width: 100%;
    padding-top: 100%;
    position: relative;
  }
  .image {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .colorOptionsWrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 7px 7px;
  }
  .colorOptionsItem {
    width: 15px;
    height: 15px;
    + .colorOptionsItem {
      margin-left: 5px;
    }
  }
}
</style>
