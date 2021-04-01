<!-- 复杂的通用组件最好也用 module, 减少全局样式冲突, 比如这个组件里用到了 .price, 就会和 <price> 组件冲突 -->
<template>
  <view :class="{
    [$style['featuredProducts']]: true,
    'scroll': layout === 'scroll'
  }" :style="css">
    <view v-for="product in products.data" :key="product.id" :style="gridStyle" :class="$style['gridWrapper']">
      <view
        :class="{
          [$style['productItem']]: true,
          [$style['productItemFullwidth']]: columns === 1
        }"
        :style="settingsData.backgroundColor ? {
          'borderRadius': '4px',  // 如果有底色, 就加一个圆角
          'backgroundColor': settingsData.backgroundColor
        } : {}"
        @tap="goToProduct(product.name)"
      >
        <view :class="$style['imageWrapper']">
          <view
            :class="$style['image']" :style="{
              'paddingTop': imagePaddingTop,
              'backgroundImage': backgroundImageUrl(product.image, 200),
            }"
          ></view>
        </view>
        <view :class="$style['textWrapper']">
          <view :class="$style['title']">
            <text>{{ product.title }}</text>
            <text style="opacity: 0.8; font-size: 0.9em;">{{ '\n' }}{{ product.description }}</text>
          </view>
          <view :class="$style['priceAndButton']">
            <price
              :class="$style['price']" :highlight="true" :keepZero="false"
              :price="product.price" :compareAtPrice="product.compare_at_price"
            ></price>
            <button
              class="button button--round button--mini button--primary"
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
        layout: 'grids',  // scroll|grids
        backgroundColor: null,  // 商品格子的底色
        productsQuery: {},  // 商品过滤参数
        gridGap: 0,  // px 整数
        imageRatio: 1,  // 宽高比
        columns: 1,
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
    layout() {
      // scroll 或者是 grids
      return this.settingsData.layout || 'grids'
    },
    columns() {
      return Math.max(1, +this.settingsData.columns || 0)
    },
    gridStyle() {
      const style = {}
      const columns = this.columns
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
    // 现在在 css 里直接加上了固定的 padding
    // textWrapperPadding() {
    //   if (this.settingsData.backgroundColor) {
    //     return +this.settingsData.columns === 1 ? '0.5em 1em' : '0.5em 0.5em'
    //   } else {
    //     return +this.settingsData.columns === 1 ? '0 1em' : '0.5em 0'
    //   }
    // }
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
          fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price'].join(',')
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

<style lang="scss" module>
.featuredProducts {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  &:global(.scroll) {
    flex-wrap: nowrap;
    overflow-x: scroll;
    > .gridWrapper {
      flex: none;
    }
  }
}
.productItem {
  overflow: hidden;
}
.imageWrapper {
  //
}
.image {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.textWrapper {
  // 始终加上 padding
  padding: 0.5em 0.5em;
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
.priceAndButton {
  .price {
    display: block;
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
  :global(.button) {
    margin-top: 1em;
    margin-bottom: 0.5em;
    width: 70px;
  }
}

/* 覆盖 column === 1 时候的样式 */
.productItemFullwidth {
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  .imageWrapper {
    flex: 1;
  }
  .textWrapper {
    flex: 2;
    // 始终加上 padding, fullwidth 的大一点
    padding: 0.5em 1em;
  }
  .title {
    height: 4.2em;
    -webkit-line-clamp: 3;
  }
  .priceAndButton {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1em;
    .price {
      font-size: 1.1em;
    }
    :global(.button), .price {
      margin: 0;
    }
  }
  // .image {
  //   min-height: 100%;  // 右边的文字有可能比左边的图片高
  // }
}
</style>
