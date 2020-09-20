<template>
  <view :class="$style['row']" :style="css">
    <view
      v-for="product in products" :key="product.id"
      :class="$style['grid']"
      @tap="goToProduct(product.name)"
    >
      <view :class="$style['productItem']">
        <view :class="$style['imageWrapper']">
          <image :class="$style['image']" mode="aspectFill" :src="optimizeImage(product.image, 200)"></image>
          <view
            :class="$style['productGrowthValue']"
            v-if="product.metafields.substores && product.metafields.substores.growth_value"
          >
            <text class="el-icon-star-on"></text>成长值 {{ product.metafields.substores.growth_value }}
          </view>
        </view>
        <view :class="$style['textWrapper']">
          <view :class="$style['title']">{{ product.title }}</view>
          <view :class="$style['description']">{{ product.description }}</view>
          <price
            :class="$style['price']" :highlight="true" :keepZero="true"
            :price="product.price" :compareAtPrice="product.compare_at_price"
          ></price>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { optimizeImage } from '@/utils/image'
import Price from '@/components/Price'
/*
 * virtual-list 固定传入的 props 的 key 是 data, 包含了列表所有数据
 * 为了避免混淆, 定义一个名字是 product 的 computed, 在 template 里用 product 不用 data
 */
export default {
  components: {
    Price
  },
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
    optimizeImage,
    goToProduct(productName) {
      /* 没有特别原因不要用 wx 的方法, 全部用 Taro 上的方法 */
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    }
  }
}
</script>

<style lang="scss" module>
/* --------- postcss-pxtransform disable*/
/* 禁止 px 到 rpx 转换, 这里因为用到了 systemInfo 里面的尺寸来计算每一个商品的高度, 所以全部用 px */
/* 之前 pxTransform 初始化有问题, 现在修复了, 所以这一页现在 js 里可以正常计算 rpx */
@import '@/styles/mixins';
@import '@/styles/variables';
.row {
  display: flex;
  align-items: top;
  // justify-content: space-evenly;
  padding: 0 5px;
  justify-content: space-between;
}
.grid {
  margin-top: 10px;
  padding: 0 5px;
  width: 50%;
  height: 100%;
  // border: 1px solid rgba(#000, 0.1);
}
.productItem {
  width: 100%;
  border-radius: 5px;
  background-color: #fff;
  overflow: hidden;
}
.textWrapper {
  padding: 5px 7px;
}
.title,
.description {
  overflow: hidden;
  font-size: 12px;
  line-height: 20px;
  height: 20px;
  word-break: break-all;
  @include ellipsis(1);
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
.productGrowthValue {
  position: absolute;
  bottom: 5px;
  left: 5px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: bold;
  line-height: 18px;
  height: 18px;
  border-radius: 2px;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(109deg, #e8cca7, #edd6b8 53%, #e6caa5 83%);
  color: #5c411a;
}
.price {
  line-height: 24px;
  height: 24px;
  margin-left: 0.2em;
}
</style>
