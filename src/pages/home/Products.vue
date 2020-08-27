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
      vendor: 1479,
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
.products--rainfall {
  @include clearfix();
  padding: 20px 10px;
  .column {
    float: left;
    width: 50%;
    padding-left: 10px;
    padding-right: 10px;
  }
  .product-item {
    width: 100%;
    margin-bottom: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 10px rgba(#000, 0.2);
    overflow: hidden;
  }
  .product-text {
    padding: 15px 15px 20px;
  }
  .product-title,
  .product-description {
    overflow: hidden;
    font-size: 24px;
    line-height: 30px;
    letter-spacing: 1px;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 10px;
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
