<template>
  <view :class="$style['item']" @tap="goToProduct(product.name)">
    <image
      :class="$style['image']" mode="widthFix" :lazy-load="true"
      :src="optimizeImage(product.image)"
    ></image>
    <view :class="$style['text']">
      <view :class="$style['title']">{{ product.title }}</view>
      <view :class="$style['description']" v-if="product.description">{{ product.description }}</view>
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
$color-text: #262626;
$color-text-light: #555;
.item {
  width: 100%;
  margin-bottom: 10px;
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
.title {
  font-weight: 500;
  color: $color-text;
}
.description {
  color: $color-text-light;
}
.image {
  display: block;
  width: 100%;
}
</style>
