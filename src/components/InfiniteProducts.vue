<template>
  <view :class="$style['container']">
    <view v-for="(product, index) in products.data" :key="product.id" :class="$style['grid']">
      <view :class="$style['productItem']" @tap="goToProduct(product.name)">
        <view :class="$style['imageWrapper']">
          <image
            :class="$style['image']" mode="aspectFill" :lazy-load="true"
            :src="optimizeImage(product.image)"
          ></image>
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
import _ from 'lodash'
import Taro from '@tarojs/taro'
import ListTable from '@/mixins/ListTable'
import { optimizeImage } from '@/utils/image'
import Price from '@/components/Price'

export default {
  name: 'InfiniteProduct',
  mixins: [
    ListTable('products', { urlRoot: '/shopfront/product/' })
  ],
  components: {
    Price
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
      fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price'].join(',')
    }, { fetch: false })
    await this.fetchList()
  },
  methods: {
    optimizeImage,
    onReachBottom() {
      const { data, page, pageSize, count } = this.products
      if (data.length < 30 && page * pageSize < count) {
        this.fetchMore()
      } else {
        // 显示 "点击查看更多" 进入全部商品列表
        this.viewMore = true
      }
    },
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
