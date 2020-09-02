<template>
  <view class="block--featured-products" :style="css">
    <view
      v-for="product in products.data" :key="product.id"
      class="product-item" :style="gridStyle"
    >
      <view class="image" :style="{
        'paddingTop': paddingTop,
        'backgroundImage': backgroundImageUrl(product.image, 600)
      }"></view>
      <view class="title">{{ textValue(product.title) }}</view>
      <view class="price">
        <text class="price-sale">{{ product.price|currency({removeTrailingZero: true}) }}</text>
        <text
          v-if="+product.compare_at_price !== +product.price" class="price-compare"
        >{{ product.compare_at_price|currency({removeTrailingZero: true}) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        productsQuery: {},  // 商品过滤参数
        gridGap: 0,  // px 整数
        imageRatio: 1,  // 宽高比
        columns: 3
      })
    }
  },
  data() {
    return {
      products: {
        data: [],
        pending: false
      }
    }
  },
  computed: {
    gridStyle() {
      const style = {}
      const columns = Math.max(1, +this.settingsData.columns || 0)
      const gridGap = +this.settingsData.gridGap || 0
      const widthPercent = (100 / columns).toFixed(6)
      style['width'] = `${widthPercent}%`
      style['padding'] = Taro.pxTransform(`${parseInt(gridGap/2)}px`)
      style['fontSize'] = columns >= 3 ? '0.75em' : (columns === 2 ? '0.85em' : '1em')
      return style
    },
    paddingTop() {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      return `${percent}%`
    }
  },
  mounted() {
    this.fetchProducts()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    textValue(textObj) {
      if (_.isString(textObj)) {
        return textObj
      } else if (_.isObject(textObj)) {
        return _.get(textObj, 'value')
      } else {
        return '' + textObj
      }
    },
    async fetchProducts() {
      this.products.pending = true
      const res = await API.get('/shopfront/product/', {
        params: { ...this.settingsData.productsQuery }
      })
      this.products = {
        data: res.data.results,
        pending: false
      }
    }
  },
  filters: {
    // text(textObj) {
    //   if (_.isString(textObj)) {
    //     return textObj
    //   } else if (_.isObject(textObj)) {
    //     return _.get(textObj, 'value')
    //   } else {
    //     return '' + textObj
    //   }
    // }
  }
}
</script>

<style lang="scss">
.block--featured-products {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  .product-item {}
  .image {
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
</style>