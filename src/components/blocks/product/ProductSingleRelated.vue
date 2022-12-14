<template>
  <view :class="$style['section']" :style="css">
    <view :class="$style['sectionTitle']">猜你喜欢</view>
    <view :class="$style['container']">
      <view v-for="(product, index) in relatedProducts" :key="product.id" :class="$style['grid']">
        <view :class="$style['productItem']" @tap="goToProduct(product.name)">
          <view :class="$style['imageWrapper']">
            <image
              :class="$style['image']" mode="aspectFill" :lazy-load="true"
              :src="optimizeImage(product.image, 200)"
            ></image>
          </view>
          <view :class="$style['textWrapper']">
            <view :class="$style['title']">
              <text>{{ product.title }}</text>
              <text style="opacity: 0.8; font-size: 0.9em;">{{ '\n' }}{{ product.description }}</text>
            </view>
            <price
              :highlight="true" :keepZero="false"
              :price="product.price" :compareAtPrice="product.compare_at_price"
            ></price>
          </view>
        </view>
      </view>
      <!-- /.grid -->
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'

/* 页面私有组件放在页面同一个目录下,
因为 taro 无法实现 vue 的 scoped css, 样式写在页面和组件里都可以, 注意 class 冲突就行 */
export default {
  name: 'ProductSingleRelated',
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    },
    product: {
      type: Object,
      required: true
    },
  },
  components: {
    Price
  },
  data() {
    return {
      relatedProducts: []
    }
  },
  mounted() {
    this.fetchRelatedProducts()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    goToProduct(productName) {
      // 用 redirectTo 避免出现太多商品页面入栈
      Taro.redirectTo({ url: `/pages/product/index?name=${productName}` })
    },
    fetchRelatedProducts() {
      const params = {
        fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price'].join(','),
        random_fill: 1,
        page_size: 6
      }
      const url = `/shopfront/product/${this.product.id}/related/`
      API.get(url, { params }).then((res) => {
        const relations = _.isArray(res.data) ? res.data : _.get(res.data, 'results', [])
        this.relatedProducts = relations || []
      })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.section {
  overflow: hidden;
}
.sectionTitle {
  width: 100%;
  padding: 15px 15px 0;
  font-size: 15px;
  text-align: center;
  font-weight: bold;
}
.container {
  @include clearfix();
  padding: 5px;
}
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
.title {
  font-weight: 500;
  color: $color-text;
  font-size: 12px;
  line-height: 15px;
  height: 45px;
  letter-spacing: 1px;
  word-break: break-all;
  @include ellipsis(3);
  margin-bottom: 5px;
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
