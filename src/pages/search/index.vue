<template>
  <view>
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
    const listHeight = windowHeight - 40
    const ratio = 375 / windowWidth  // 这个项目的设计尺寸是 375, Taro 那里也是配置了 375 为设计尺寸, 而不是默认的 750
    const itemHeight = ((windowWidth - 3 * (10 / ratio)) / 2) + (32 + 10) / ratio
    /* virtual-list 会根据 listHeight/itemHeight 判断首屏幕渲染几个 item */
    return {
      listHeight: listHeight,
      itemHeight: parseInt(itemHeight + 1),  // 最后加个1
      ProductItem
    }
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

<style lang="scss">
/* --------- postcss-pxtransform disable*/
/* 禁止 px 到 rpx 转换, 这里因为用到了 systemInfo 里面的尺寸来计算每一个商品的高度, 所以全部用 px */
/* 之前 pxTransform 初始化有问题, 现在修复了, 所以这一页现在 js 里可以正常计算 rpx */
.product-row {
  display: flex;
  align-items: top;
  // justify-content: space-evenly;
  padding: 0 5px;
  justify-content: space-between;
}
.product-grid {
  padding: 5px;
  width: 50%;
  height: 100%;
  // border: 1px solid rgba(#000, 0.1);
}
.product-title {
  overflow: hidden;
  font-size: 14px;
  line-height: 16px;
  height: 32px;
  word-break: break-all;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.product-image-wrapper {
  width: 100%;
  padding-top: 100%;
  position: relative;
}
.product-image {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
