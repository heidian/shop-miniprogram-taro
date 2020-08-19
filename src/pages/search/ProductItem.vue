<template>
  <view class="product-row" :style="css">
    <view
      v-for="product in products" :key="product.id"
      class="product-grid"
    >
      <view class="product-image-wrapper">
        <image class="product-image" mode="aspectFill" :src="optimizeImage(product.image)"></image>
      </view>
      <view class="product-title">Product {{ product.id }} | {{ product.title }}</view>
    </view>
  </view>
</template>

<script>
import { optimizeImage } from '@/utils/image'
/*
 * virtual-list 固定传入的 props 的 key 是 data, 包含了列表所有数据
 * 为了避免混淆, 定义一个名字是 product 的 computed, 在 template 里用 product 不用 data
 */
export default {
  props: ['index', 'data', 'css'],
  mounted() {
    // console.log(JSON.stringify(this.data))
  },
  computed: {
    products() {
      return { ...this.data[this.index] }
    }
  },
  methods: {
    optimizeImage
  }
}
</script>

<style lang="scss"></style>
