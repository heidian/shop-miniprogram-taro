<template>
  <view class="product-item" @tap="goToProduct(product.name)">
    <image
      class="product-image" mode="widthFix" :lazy-load="true"
      :src="optimizeImage(product.image)"
    ></image>
    <view class="product-text">
      <view class="product-title">{{ product.title }}</view>
      <view class="product-description" v-if="product.description">{{ product.description }}</view>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { optimizeImage } from '@/utils/image'
/*
 * virtual-list 固定传入的 props 的 key 是 data, 包含了列表所有数据
 * 为了避免混淆, 定义一个名字是 product 的 computed, 在 template 里用 product 不用 data
 */
export default {
  name: 'InfiniteProductItem',
  props: {
    product: {
      type: Object,
      default: () => ({})
    }
  },
  mounted() {
    // console.log(JSON.stringify(this.data))
  },
  computed: {},
  methods: {
    optimizeImage,
    goToProduct(productName) {
      /* 没有特别原因不要用 wx 的方法, 全部用 Taro 上的方法 */
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    }
  }
}
</script>

<style lang="scss"></style>
