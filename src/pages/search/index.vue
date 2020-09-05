<template>
  <view :class="$style['page']">
    <scroll-view :class="$style['categoriesBar']" :scroll-x="true" :enhanced="true" :show-scrollbar="false">
      <view :class="$style['categoriesInner']">
        <view
          v-for="category in categories.data" :key="category.id"
          :class="[$style['categoryItem'], (category.id === activeCategoryId) && 'is-active']"
          @tap="filterCategory(category.id)"
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
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
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
    listData() {
      return _.chunk(this.products.data, 2)
    },
    listLength() {
      // 向上取整
      return parseInt((this.products.data.length + 1) / 2)
    }
  },
  mounted() {
    this.$store.dispatch('categories/list')
    this.updateDefaultParams({
      fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price'].join(',')
    }, { fetch: false })
    this.fetchList()
  },
  methods: {
    async listReachBottom() {
      Taro.showNavigationBarLoading()
      await this.fetchMore()
      Taro.hideNavigationBarLoading()
    },
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
        this.listReachBottom()
      }
    },
    async filterCategory(categoryId) {
      Taro.showNavigationBarLoading()
      await this.updateFilter({
        category: categoryId
      }, {
        partial: false,
        fetch: true
      })
      Taro.hideNavigationBarLoading()
    }
  }
}
</script>

<style lang="scss" module>
$color-bg-gray: #f6f6f6;
$color-text: #262626;
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
