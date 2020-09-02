<template>
  <view class="related-products">
    <!-- Taro 是先用 vue 完全编译好输出节点再一次性填充到一个 wxml 模板里, 这里的 key 写法和 vue 一样 -->
    <view
      v-for="product in relatedProducts" :key="product.id"
      class="product-item"
      @tap="goToProduct(product.name)"
    >
      <view class="image" :style="{ 'backgroundImage': backgroundImageUrl(product.image, 600)}"></view>
      <view class="title">{{ textValue(product.title) }}</view>
      <view class="price">
        <text class="price-sale">{{ product.price|currency({removeTrailingZero: true}) }}</text>
        <text
          v-if="+product.compare_at_price !== +product.price" class="price-compare"
        >{{ product.compare_at_price|currency({removeTrailingZero: true}) }}</text>
      </view>
    </view>
    <!-- 闭合标签尽量和文本内容紧贴, 避免出现前后空格, 内部元素是标签就随意 -->
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
/* 页面私有组件放在页面同一个目录下,
因为 taro 无法实现 vue 的 scoped css, 样式写在页面和组件里都可以, 注意 class 冲突就行 */
export default {
  name: 'relatedProducts',
  props: {
    productId: {
      type: [Number, String],
      default: () => {
        return ''
      }
    },
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
    textValue (textObj) {
      if (_.isString(textObj)) {
        return textObj
      } else if (_.isObject(textObj)) {
        return _.get(textObj, 'value')
      } else {
        return '' + textObj
      }
    },
    goToProduct (productName) {
      /* 没有特别原因不要用 wx 的方法, 全部用 Taro 上的方法 */
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    },
    fetchRelatedProducts () {
      const params = {
        random_fill: 1,
        page_size: 6
      }
      const url = `/shopfront/product/${this.productId}/related/`
      API.get(url, { params }).then((res) => {
        const relations = _.isArray(res.data) ? res.data : _.get(res.data, 'results', [])
        this.relatedProducts = relations || []
      })
    }
  }
}
</script>

<style lang="scss">
.related-products {
  padding: 10px 15px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  .product-item {
    width: 48%;
    margin-bottom: 10px;
    .image {
      width: 100%;
      padding-top: percentage(4/3);
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
    }
    .title {
      margin-top: 0.5em;
      line-height: 1.4em;
      height: 2.8em;
      font-weight: bold;
      overflow : hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .price {
      margin-top: 0.1em;
      margin-bottom: 0.5em;
    }
    .price-sale {
      font-weight: bold;
      font-size: 1.2em;
    }
    .price-compare {
      margin-left: 0.1em;
      opacity: 0.7;
      text-decoration: line-through;
    }
  }
  // .product-item:nth-child(2n) {
  //   margin-right: 15px;
  // }
}
</style>
