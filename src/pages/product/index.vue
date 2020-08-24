<template>
  <view class="page page--product">
    <view class="page__section">
      <swiper
        class="product__images"
        indicatorColor='#999'
        indicatorActiveColor='#333'
        circular
        :indicatorDots="true"
        interval="5000"
        autoplay
      >
        <swiper-item class="product__images__swiper-item" v-for="image in product.images" :key="image.id">
          <image class="product__images__swiper-item__image" mode="aspectFit" :src="optimizeImage(image)"></image>
        </swiper-item>
      </swiper>
      <!-- 商品价格和添加心愿单 -->
      <view class="product__header">
        <view class="product__price-wrapper">
          <view class="product__price">
            <text class="product__price__currency">￥</text>
            <text class="product__price__value">{{ product.price }}</text>
          </view>
          <view class="product__compare-at-price" v-if="product.compare_at_price && product.compare_at_price > product.price">
            <text class="product__compare-at-price__currency">￥</text>
            <text class="product__compare-at-price__value">{{ product.compare_at_price }}</text>
          </view>
        </view>
        <view class="product__add-to-wishlist">
          心愿单
        </view>
      </view>
      <!-- 商品标题和描述 -->
      <view class="product__title">{{ product.title }}</view>
      <view class="product__description">{{ product.description }}</view>
    </view>

    <view class="page__section">
      <view class="cell" @tap="onToggleSelectVariant">
        <view class="cell__label">已选</view>
        <view class="cell__value">{{ currentVariant.title }}</view>
        <view class="cell__ft">
          <image class="cell__ft__icon" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
        </view>
      </view>
    </view>

    <view class="page__section">

    </view>
    <select-variants
      :product="product"
      :currentVariant="currentVariant"
      :drawerOpened="drawerOpened"
      @onToggleDrawer="onToggleSelectVariant"/>
  </view>
</template>

<script>
import { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import ProductVariants from './ProductVariants'
import SelectVariants from './SelectVariants'

export default {
  name: 'Product',
  components: {
    /* 组件名称用首字母大写, template 里面标签不能用大写, 全部用小写+减号 */
    ProductVariants,
    SelectVariants
  },
  data() {
    /* getCurrentInstance 只在生命周期方法里用, 一般在 created() 或者 data() 方法里面用 */
    const { id, name } = getCurrentInstance().router.params
    /* 服务器端取下来的数据放入 this.[propertyName] 以后, 其他处理过的数据不要放进 this.[propertyName], 直接放在 this 下面,
    data() 方法返回的属性和本地变量名称用驼峰, 其他 object 的 key 不做限制 */
    return {
      pending: true,
      productId: id,
      productName: name,
      product: {
        variants: []
      },
      drawerOpened: false,
      currentVariant: {}
    }
  },
  created() {},
  async mounted() {
    await this.fetchProduct()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    /* 方法名称用驼峰 */
    async fetchProduct() {
      // TODO 要处理 404
      const fields = ['id', 'title', 'image', 'variants', 'price', 'created_at']
      let product = null
      if (this.productId) {
        const res = await API.get(`/shopfront/product/${this.productId}/`, {
          params: { fields }
        })
        product = res.data
      } else if (this.productName) {
        /* 不要拼接 url, 用 params */
        const res = await API.get('/shopfront/product/', {
          params: { fields, name: this.productName }
        })
        /* res.data.results 一定是数组不会有问题, 只需要看长度就行 */
        product = res.data.results[0]
      }
      if (product) {
        this.product = product
        const variant = _.find(product.variants || [], { is_available: true }) || product.variants[0]
        this.currentVariant = variant
      } else {
        // 抛出异常
      }
    },
    onToggleSelectVariant (status) {
      this.drawerOpened = status === undefined ? !this.drawerOpened : status
    }
  }
}
</script>

<style lang="scss">
/* Taro vue 版本不支持 scoped, 只能用 cssModule, 这里不要写 scoped, 平时注意 class 冲突 */
.product-image-bg {
  /* 没特殊原因全部用 px, Taro 会转成 rpx, 按照 750px 的设计稿实际像素尺寸来写
  除非是要结合 js 计算尺寸, 比如使用屏幕宽度等, 这时候需要禁用 px 到 rpx 的转换 (可以参考 search.vue), 这时候 px 按照逻辑尺寸来写 */
  width: 200px;
  height: 200px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

/* Images Swiper */
.product__images {
  width: 100vw;
  height: 100vw;
}
.product__images__swiper-item__image {
  width: 100%;
  height: 100%;
}

.product__header {
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product__price-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.product__price,
.product__compare-at-price {
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
}
.product__price {
  color: red;
  &__currency {
    font-size: 24px;
    line-height: 1;
  }
  &__value {
    font-size: 40px;
    line-height: 1;
    font-weight: bold;
  }
}
.product__compare-at-price {
  color: #999999;
  text-decoration: line-through;
  margin-left: 6px;
  &__currency {
    font-size: 22px;
    line-height: 1;
  }
  &__value {
    font-size: 28px;
    line-height: 1;
    font-weight: bold;
  }
}
.product__add-to-wishlist {
  font-size: 22px;
}

/* 标题和描述 */
.product__title {
  padding: 10px 30px;
  font-size: 30px;
  font-weight: bolder;
  text-align: justify;
  line-height: 1.6;
}
.product__description {
  padding: 10px 30px;
  font-size: 24px;
  color: #999999;
  text-align: justify;
}
.cell__ft__icon {
  width: 20px;
  height: 24px;
}
</style>
