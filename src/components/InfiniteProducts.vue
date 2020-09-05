<template>
  <view :class="$style['container']">
    <view v-for="(product, index) in products.data" :key="product.id" :class="$style['grid']">
      <view :class="$style['productItem']" @tap="goToProduct(product.name)">
        <view :class="$style['imageWrapper']">
          <image
            :class="$style['image']" mode="widthFix" :lazy-load="true"
            :src="optimizeImage(product.image)"
          ></image>
        </view>
        <view :class="$style['textWrapper']">
          <view :class="$style['title']">{{ product.title }}</view>
          <view :class="$style['description']">{{ product.description }}</view>
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
      :class="$style['viewMore']"
    >点击查看更多</navigator>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import ListTable from '@/mixins/ListTable'
import { optimizeImage } from '@/utils/image'

export default {
  name: 'InfiniteProduct',
  mixins: [
    ListTable('products', { urlRoot: '/shopfront/product/' })
  ],
  components: {},
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
@import '@/styles/_mixins';
$color-text: #262626;
$color-text-light: #555;
.container {
  @include clearfix();
  padding: 5px 5px;
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
.viewMore {
  clear: both;
  text-align: center;
  padding: 15px;
}
</style>
