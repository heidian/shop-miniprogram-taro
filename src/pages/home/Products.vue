<template>
  <view class="products--rainfall">
    <view class="column">
      <product-item
        v-for="(product, index) in products.data" :key="product.id"
        v-if="index % 2 === 1"
        :product="product"
      ></product-item>
    </view>
    <view class="column">
      <product-item
        v-for="(product, index) in products.data" :key="product.id"
        v-if="index % 2 === 0"
        :product="product"
      ></product-item>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import ListTable from '@/mixins/ListTable'
import ProductItem from './ProductItem'

export default {
  name: 'Home',
  mixins: [
    ListTable('products', { urlRoot: '/shopfront/product/' })
  ],
  components: {
    ProductItem
  },
  computed: {
    //
  },
  async mounted() {
    // await this.updatePageSize(100)
    await this.updateFilter({
      // vendor: 1479,
      fields: ['id', 'name', 'title', 'description', 'image', 'price'].join(',')
    })
    // await this.fetchList()
  },
  methods: {
    //
  }
}
</script>

<style lang="scss">
@import '@/styles/_mixins';
$color-bg-gray: #f6f6f6;
.products--rainfall {
  @include clearfix();
  padding: 10px 5px;
  background-color: $color-bg-gray;
  .column {
    float: left;
    width: 50%;
    padding-left: 5px;
    padding-right: 5px;
  }
  .product-item {
    width: 100%;
    margin-bottom: 10px;
    border-radius: 5px;
    // box-shadow: 0 3px 5px rgba(#000, 0.2);
    background-color: #fff;
    overflow: hidden;
  }
  .product-text {
    padding: 7px 7px 10px;
  }
  .product-title,
  .product-description {
    overflow: hidden;
    font-size: 12px;
    line-height: 15px;
    letter-spacing: 1px;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 5px;
  }
  .product-title {
    font-weight: 500;
    opacity: 0.9;
  }
  .product-description {
    opacity: 0.7;
  }
  .product-image {
    display: block;
    width: 100%;
  }
}
</style>
