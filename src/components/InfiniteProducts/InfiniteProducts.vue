<template>
  <view :class="$style['container']">
    <view :class="$style['column']">
      <infinite-product-item
        v-for="(product, index) in products.data" :key="product.id"
        v-if="index % 2 === 1"
        :product="product"
      ></infinite-product-item>
    </view>
    <view :class="$style['column']">
      <infinite-product-item
        v-for="(product, index) in products.data" :key="product.id"
        v-if="index % 2 === 0"
        :product="product"
      ></infinite-product-item>
    </view>
    <navigator
      v-if="viewMore"
      url="/pages/search/index" open-type="navigateTo"
      :class="$style['viewMore']"
    >点击查看更多</navigator>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import ListTable from '@/mixins/ListTable'
import InfiniteProductItem from './InfiniteProductItem'

export default {
  name: 'InfiniteProduct',
  mixins: [
    ListTable('products', { urlRoot: '/shopfront/product/' })
  ],
  components: {
    InfiniteProductItem
  },
  data() {
    return {
      viewMore: false
    }
  },
  computed: {
    //
  },
  async mounted() {
    this.updateDefaultParams({
      fields: ['id', 'name', 'title', 'description', 'image', 'price'].join(',')
    }, { fetch: false })
    await this.fetchList()
  },
  methods: {
    onReachBottom() {
      const { data, page, pageSize, count } = this.products
      if (data.length < 30 && page * pageSize < count) {
        this.fetchMore()
      } else {
        // 显示 "点击查看更多" 进入全部商品列表
        this.viewMore = true
      }
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/_mixins';
.container {
  @include clearfix();
  padding: 10px 5px;
}
.column {
  float: left;
  width: 50%;
  padding-left: 5px;
  padding-right: 5px;
}
.viewMore {
  clear: both;
  text-align: center;
  padding: 15px;
}
</style>
