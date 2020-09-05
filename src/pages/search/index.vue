<template>
  <view :class="$style['page']">
    <!-- <view v-for="product in products.data">
      <text>{{ product.id }}</text>
    </view> -->
    <virtual-list
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
    const topBarHeight = 40  // 顶部过滤条
    const listHeight = windowHeight - topBarHeight / ratio
    const containerWidth = windowWidth - 2 * (5 / ratio)
    const topBottomPadding = (2 * 5) / ratio
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
      ProductItem
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
    listData() {
      return _.chunk(this.products.data, 2)
    },
    listLength() {
      // 向上取整
      return parseInt((this.products.data.length + 1) / 2)
    }
  },
  async mounted() {
    this.fetchList()
  },
  methods: {
    listReachBottom() {
      this.fetchMore()
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
    }
  }
}
</script>

<style lang="scss" module>
$color-bg-gray: #f6f6f6;
page {
  background-color: $color-bg-gray;
}
.page {
  padding-top: 40px;
  overflow: hidden;
  height: 100vh;
}
</style>
