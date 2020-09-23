<template>
  <view class="block--featured-products" :style="css">
    <view
      v-for="product in products.data" :key="product.id"
      class="grid" :style="gridStyle"
    >
      <view
        class="product-item"
        :style="settingsData.backgroundColor ? {
          'borderRadius': '4px',  // 如果有底色, 就加一个圆角
          'backgroundColor': settingsData.backgroundColor
        } : {}"
        @tap="goToProduct(product.name)"
      >
        <view class="image" :style="{
          'paddingTop': paddingTop,
          'backgroundImage': backgroundImageUrl(product.image, 200)
        }"></view>
        <view class="text-wrapper" :style="{
          // 如果有底色, 就加一个左右边距
          'padding': settingsData.backgroundColor ? '0.5em' : '0.5em 0'
        }">
          <view class="title">{{ product.title }}</view>
          <view class="price">
            <text class="price-sale">{{ product.price|currency }}</text>
            <text
              v-if="+product.compare_at_price > +product.price" class="price-compare"
            >{{ product.compare_at_price|currency }}</text>
            <!-- 这里一定要用 > 不能用 !==, 因为如果 compare_at_price 是 null, 那也是不等于 -->
          </view>
          <button
            class="button--round button--mini button--dark"
            v-if="settingsData.buyButton"
            :style="{'backgroundColor': settingsData.buyButtonBackground}"
          >购买</button>
        </view>
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
        backgroundColor: null,  // 商品格子的底色
        productsQuery: {},  // 商品过滤参数
        gridGap: 0,  // px 整数
        imageRatio: 1,  // 宽高比
        columns: 3,
        buyButton: false,
        buyButtonBackground: null
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
      style['fontSize'] = columns >= 3 ? '0.75em' : (columns === 2 ? '0.95em' : '1em')
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
    async fetchProducts() {
      this.products.pending = true
      const res = await API.get('/shopfront/product/', {
        params: { ...this.settingsData.productsQuery }
      })
      this.products = {
        data: res.data.results,
        pending: false
      }
    },
    goToProduct(productName) {
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    }
  }
}
</script>

<style lang="scss">
.block--featured-products {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  .product-item {
    overflow: hidden;
  }
  .image {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .text-wrapper {
    button {
      display: block;
      margin: 1em auto 0.5em;
      width: 70px;
    }
  }
  .title {
    line-height: 1.4em;
    height: 2.8em;
    font-weight: 500;
    overflow : hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .price {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
  .price-sale {
    font-weight: 500;
    font-size: 1.1em;
  }
  .price-compare {
    font-size: 0.85em;
    margin-left: 0.1em;
    opacity: 0.6;
    text-decoration: line-through;
  }
}
</style>
