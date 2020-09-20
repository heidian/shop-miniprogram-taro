<template>
  <view :class="$style['page']">
    <scroll-view
      :class="$style['categoriesBar']"
      :scroll-x="true" :enhanced="true" :show-scrollbar="false"
      :scroll-into-view="activeCategoryId ? `search-category-${activeCategoryId}` : null"
      :scroll-with-animation="true"
    >
      <view :class="$style['categoriesInner']">
        <view
          v-for="category in categories.data" :key="category.id"
          :class="[$style['categoryItem'], (category.id === activeCategoryId) && 'is-active']"
          :id="`search-category-${category.id}`"
          @tap="() => filterCategory(category.id)"
        ><text :class="$style['categoryText']">{{ category.title }}</text></view>
      </view>
    </scroll-view>
    <virtual-list
      wclass="virtual-list"
      :height="listHeight"
      :item-data="listData"
      :item-count="listLength"
      :item-size="itemHeight"
      :item="ProductItem"
      width="100%"
      @scroll="onScroll"
    ></virtual-list>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import ProductItem from './ProductItem'
import ListTable from '@/mixins/ListTable'

const listTableMixin = ListTable('products', { storeName: 'lists/products' })
// const listTableMixin = ListTable('products', { urlRoot: '/shopfront/product/' })

export default {
  name: 'Search',
  mixins: [
    listTableMixin  // 这个 mixin 会定义一个叫 products 的 computed 对象
  ],
  components: {},
  data() {
    const { windowHeight, windowWidth } = Taro.getSystemInfoSync()
    const ratio = 375 / windowWidth  // 这个项目的设计尺寸是 375, Taro 那里也是配置了 375 为设计尺寸, 而不是默认的 750
    const topBarHeight = 35 / ratio  // 顶部过滤条
    const listHeight = windowHeight - topBarHeight
    const containerWidth = windowWidth - 2 * (5 / ratio)
    const topBottomPadding = (10 + 0) / ratio
    const leftRightPadding = (2 * 5) / ratio
    const textPadding = (5 + 5) / ratio
    const imageHeight = containerWidth / 2 - leftRightPadding
    const titleHeight = 20 / ratio
    const descHeight = 20 / ratio
    const priceHeight = 24 / ratio
    const itemHeight = topBottomPadding + imageHeight + titleHeight + descHeight + priceHeight + textPadding
    /* virtual-list 会根据 listHeight/itemHeight 判断首屏幕渲染几个 item */
    return {
      listHeight: listHeight,
      itemHeight: parseInt(itemHeight + 1),  // 最后加个1
      ProductItem,
      activeCategoryId: null
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  computed: {
    ...mapState(['categories']),
    ...mapGetters('categories', [
      'getRootCategoryId'
    ]),
    listData() {
      return _.chunk(this.products.data, 2)
    },
    listLength() {
      // 向上取整
      return parseInt((this.products.data.length + 1) / 2)
    }
  },
  created() {
    // 初始化过滤参数
    const defaultParams = {
      fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price', 'metafields'].join(',')
    }
    const filter = {}
    const { category } = getCurrentInstance().router.params
    filter.category = category
    this.$store.commit('lists/products/setParams', {
      filter, defaultParams
    })
  },
  async mounted() {
    // 因为要处理 activeCategory, 这里先 await 一下, categories 全局只取一次, 这样问题不大
    await this.$store.dispatch('categories/list')
    this.fetchProducts()
  },
  methods: {
    // listReachBottom() {},
    onScroll({ scrollDirection, scrollOffset }) {
      // console.log(scrollDirection, this.listHeight, scrollOffset, this.listLength * this.itemHeight)
      if (
        // 避免重复加载数据
        !this.products.pending &&
        // 只有往前滚动才触发
        scrollDirection === 'forward' &&
        // 100 = 滚动提前加载量
        this.listHeight + scrollOffset > (this.listLength * this.itemHeight - 100)
      ) {
        // this.listReachBottom()
        this.fetchProducts({ more: true })
      }
    },
    filterCategory(categoryId) {
      // 虽然 fetchProducts 里面也会计算 activeCategoryId, 但这里早点设置也没事
      this.activeCategoryId = categoryId
      this.updateFilter({ category: categoryId }, { partial: false, fetch: false })
      this.fetchProducts()
    },
    async fetchProducts({ more = false } = {}) {
      // fetchList 和 fetchMore 统一在这里调用, 因为调用前后还要处理各种 UI 元素
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        // TODO active category
        this.activeCategoryId = this.getRootCategoryId(this.products.filter.category)
        await this.fetchList()
      }
      Taro.hideNavigationBarLoading()
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {
  padding-top: 35px;
  overflow: hidden;
  height: 100vh;
  :global(.virtual-list) {
    // padding-top: 5px;
  }
}
.categoriesBar {
  position: fixed;
  z-index: $z-index-navbar;
  left: 0;
  top: 0;
  height: 35px;
  width: 100%;
  background-color: #fff;
}
.categoriesInner {
  display: inline-block;
  white-space: nowrap;
  padding: 0 5px;
}
.categoryItem {
  display: inline-block;
  vertical-align: middle;
  padding: 0 12px;
  .categoryText {
    display: inline-block;
    font-size: 15px;
    padding-top: 5px;
    border-bottom: 2px solid transparent;
    line-height: 35px - 5px - 2px;
  }
  &:global(.is-active) {
    .categoryText {
      border-bottom-color: $color-text;
    }
  }
}
</style>
