<template>
  <view :class="$style['container']">
    <view v-for="(product, index) in products.data" :key="product.id" :class="$style['grid']">
      <view :class="$style['productItem']" @tap="goToProduct(product.name)">
        <view :class="$style['imageWrapper']">
          <image
            :class="$style['image']" mode="aspectFill" :lazy-load="true"
            :src="optimizeImage(product.image, 200)"
          ></image>
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
    <!-- <view :class="$style['column']">
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
    </view> -->
    <navigator
      v-if="viewMore"
      url="/pages/search/index" open-type="navigate"
      :class="$style['viewMore']" hover-class="none"
    >点击查看更多</navigator>
    <view v-else :class="$style['loadMore']"><text class="el-icon-more"></text></view>
  </view>
</template>

<script>
/*
一般来说, 调用 InfiniteProducts 组件的页面,
只需在自己的 onReachBottom 调用 this.$store.dispatch('lists/infiniteProducts/listMore') 就行
最多是 tab 页面在 onShow 里面加一下 this.$store.dispatch('lists/infiniteProducts/refreshList')
其他任何代码都不用写
*/
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage } from '@/utils/image'
import Price from '@/components/Price'

export default {
  name: 'InfiniteProducts',
  components: {
    Price
  },
  data() {
    return {}
  },
  computed: {
    ...mapState('lists/infiniteProducts', {
      products: (state) => state
    }),
    viewMore() {
      const { data, page, pageSize, count } = this.products
      return count && (data.length >= 30 || page * pageSize >= count)
    }
  },
  mounted() {
    this.$store.dispatch('lists/infiniteProducts/refreshList')
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
@import '@/styles/mixins';
@import '@/styles/variables';
.container {
  @include clearfix();
  padding: 5px;
}
// .column {
//   float: left;
//   width: 50%;
//   padding-left: 5px;
//   padding-right: 5px;
// }
.grid {
  float: left;
  width: 50%;
  padding: 5px;
  &:nth-child(2n+1) {
    clear: both;
  }
}
.productItem {
  width: 100%;
  border-radius: 5px;
  // box-shadow: 0 3px 5px rgba(#000, 0.2);
  background-color: #fff;
  overflow: hidden;
}
.textWrapper {
  padding: 7px;
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
.viewMore, .loadMore {
  clear: both;
  text-align: center;
}
.viewMore {
  padding: 15px;
  color: $color-text-light;
}
.loadMore {
  font-size: 20px;
  padding: 10px 15px;
  color: $color-text-lighter;
}
</style>
