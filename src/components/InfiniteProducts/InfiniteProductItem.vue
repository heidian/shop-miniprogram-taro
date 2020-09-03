<template>
  <view :class="$style['item']" @tap="goToProduct(product.name)">
    <view :class="$style['imageWrapper']">
      <image
        :class="$style['image']" mode="widthFix" :lazy-load="true"
        :src="optimizeImage(product.image)"
      ></image>
    </view>
    <view :class="$style['text']">
      <view :class="$style['title']">{{ product.title }}</view>
      <view :class="$style['description']">{{ product.description }}</view>
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

<style lang="scss" module>
@import '@/styles/_mixins';
$color-text: #262626;
$color-text-light: #555;
.item {
  width: 100%;
  border-radius: 5px;
  // box-shadow: 0 3px 5px rgba(#000, 0.2);
  background-color: #fff;
  overflow: hidden;
}
.text {
  padding: 7px 7px 10px;
}
.title,
.description {
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
</style>
