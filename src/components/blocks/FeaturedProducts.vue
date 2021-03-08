<template>
  <view class="block--featured-products" :style="css">
    <view
      v-for="product in products.data" :key="product.id"
      class="grid" :style="gridStyle"
    >
      <view
        :class="{'product-item': true, 'product-item__fullwidth': +settingsData.columns === 1}"
        :style="settingsData.backgroundColor ? {
          'borderRadius': '4px',  // 如果有底色, 就加一个圆角
          'backgroundColor': settingsData.backgroundColor
        } : {}"
        @tap="goToProduct(product.name)"
      >
        <view class="image-wrapper" :style="{'paddingTop': imagePaddingTop}">
          <image
            class="image" mode="aspectFill" :lazy-load="true"
            :src="optimizeImage(product.image, 200)"
          ></image>
        </view>
        <view class="text-wrapper" :style="{
          // 如果有底色, 就加一个左右边距
          'padding': textWrapperPadding
        }">
          <view class="title">{{ product.title }}</view>
          <view>
            <price
              class="price" :highlight="false" :keepZero="false"
              :price="product.price" :compareAtPrice="product.compare_at_price"
            ></price>
          </view>
          <view>
            <button
              class="button button--round button--mini button--dark"
              v-if="settingsData.buyButton"
              :style="{'backgroundColor': settingsData.buyButtonBackground}"
            >购买</button>
          </view>
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
import Price from '@/components/Price'

export default {
  components: {
    Price
  },
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
        query: {},
        data: [],
        pending: false,
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
    imagePaddingTop() {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      return `${percent}%`
    },
    textWrapperPadding() {
      if (this.settingsData.backgroundColor) {
        return +this.settingsData.columns === 1 ? '0.5em 1em' : '0.5em 0.5em'
      } else {
        return +this.settingsData.columns === 1 ? '0 1em' : '0.5em 0'
      }
    }
  },
  mounted() {
    this.fetchProducts()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    async fetchProducts() {
      const productsQuery = _.cloneDeep(this.settingsData.productsQuery)
      this.products.pending = true
      const res = await API.get('/shopfront/product/', {
        params: {
          ...productsQuery,
          fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price', 'metafields'].join(',')
        }
      })
      this.products = {
        query: productsQuery,
        data: res.data.results,
        pending: false
      }
    },
    goToProduct(productName) {
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    }
  },
  watch: {
    'settingsData.productsQuery': {
      handler(newVal, oldVal) {
        if (!_.isEqual(newVal, this.products.query)) {
          this.fetchProducts()
        }
      },
      deep: true,
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
  .product-item__fullwidth {
    position: relative;
    padding-right: percentage(2/3);
    .text-wrapper {
      position: absolute;
      right: 0;
      top: 0;
      width: percentage(2/3);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      button, .price {
        margin: 0;
      }
    }
  }
  .image-wrapper {
    position: relative;
  }
  .image {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .text-wrapper {
    .button {
      margin-top: 1em;
      margin-bottom: 0.5em;
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
}
</style>
