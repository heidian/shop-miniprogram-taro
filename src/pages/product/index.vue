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
          <image class="product__images__swiper-item__image" mode="aspectFit" :src="optimizeImage(image, 800)"></image>
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
    <!-- 待删除 -->
    <!-- 待删除 -->
    <view class="page__section">
      <view class="cell" @tap="() => onToggleSelectVariant('add_to_cart')">
        <view class="cell__label">已选</view>
        <view class="cell__value">{{ currentVariant.title }}</view>
        <view class="cell__ft">
          <image class="cell__ft__icon" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
        </view>
      </view>
    </view>
    <view class="page__section">
      <view class="page__section__title">图文详情</view>
      <view v-if="body_html" class="taro_html product__html" v-html="body_html"></view>
    </view>
    <view class="page__section" v-if="productId">
      <view class="page__section__title">猜你喜欢</view>
      <related-products :productId="productId"/>
    </view>
    <view class="page__footer">
      <view class="page__footer__left">
        <button class="page__footer__icon-btn" openType="contact">
          <image class="page__footer__icon-btn__icon" mode="aspectFit" :src="ICON_CUSTOMER_SERVIDE"></image>
          <text class="page__footer__icon-btn__text">客服</text>
        </button>
        <navigator url="/pages/cart/index" open-type="switchTab" class="page__footer__icon-btn">
          <image class="page__footer__icon-btn__icon" mode="aspectFit" :src="ICON_CART"></image>
          <text class="page__footer__icon-btn__text">购物车</text>
          <text v-if="cart.totalCount" class="page__footer__icon-btn--cart__count">{{ cart.totalCount > 10 ? '10+' : cart.totalCount }}</text>
        </navigator>
      </view>
      <view class="page__footer__right">
        <button class="page__footer__btn btn--blue" @tap="() => onToggleSelectVariant('add_to_cart')">
          <text class="page__footer__btn__text">加入购物车</text>
        </button>
        <button class="page__footer__btn btn--orange" @tap="() => onToggleSelectVariant('buy_now')">
          <text class="page__footer__btn__text">立即购买</text>
        </button>
      </view>
    </view>
    <navigator :url="`/pages/misc/share?product=${product.id}`" class="product__share">
      <image class="product__share__icon" src="data:image/svg+xml;base64,PHN2ZyBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1NTEuMTMgNTUxLjEzIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDU1MS4xMyA1NTEuMTMiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTQ2NS4wMTYgMTcyLjIyOGgtNTEuNjY4djM0LjQ0NmgzNC40NDZ2MzEwLjAxMWgtMzQ0LjQ1N3YtMzEwLjAxMWgzNC40NDZ2LTM0LjQ0NmgtNTEuNjY5Yy05LjUyIDAtMTcuMjIzIDcuNzAzLTE3LjIyMyAxNy4yMjN2MzQ0LjQ1NmMwIDkuNTIgNy43MDMgMTcuMjIzIDE3LjIyMyAxNy4yMjNoMzc4LjkwMmM5LjUyIDAgMTcuMjIzLTcuNzAzIDE3LjIyMy0xNy4yMjN2LTM0NC40NTZjMC05LjUyLTcuNzAzLTE3LjIyMy0xNy4yMjMtMTcuMjIzeiIvPjxwYXRoIGQ9Im0yNTguMzQyIDY1LjkzMXYyNDQuMDhoMzQuNDQ2di0yNDQuMDhsNzMuOTM3IDczLjkzNyAyNC4zNTQtMjQuMzU0LTExNS41MTQtMTE1LjUxNC0xMTUuNTE0IDExNS41MTQgMjQuMzU0IDI0LjM1NHoiLz48L3N2Zz4=" mode="aspectFit" lazy-load="false"></image>
    </navigator>
    <select-variants
      :product="product"
      :currentVariant="currentVariant"
      :drawerOpenedType="drawerOpenedType"
      @onToggleDrawer="onToggleSelectVariant"
      @onSelectVariant="onSelectVariant"/>
  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import '@tarojs/taro/html.css'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import RelatedProducts from './RelatedProducts'
import SelectVariants from './SelectVariants'
import { setTimeout } from 'timers';

const ICON_CUSTOMER_SERVIDE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjEzOSA0MjIuMTM5IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuMTM5IDQyMi4xMzk7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNMzYzLjYzMSwxNzQuNDk4aC0xLjA0NXYtMjUuNkMzNjIuNTg2LDY2LjY2NCwyOTUuOTIzLDAsMjEzLjY4OCwwUzY0Ljc5LDY2LjY2NCw2NC43OSwxNDguODk4djI1LjZoLTYuMjY5DQoJCQljLTIyLjk4OCwwLTQwLjc1MSwyMC4zNzUtNDAuNzUxLDQzLjg4NnY2NS4zMDZjLTAuNTc5LDIyLjc4NywxNy40MjUsNDEuNzI5LDQwLjIxMiw0Mi4zMDhjMC4xOCwwLjAwNSwwLjM1OSwwLjAwOCwwLjUzOSwwLjAxDQoJCQloMzguNjYxYzUuNDc2LTAuMjU3LDkuNzA3LTQuOTA2LDkuNDQ5LTEwLjM4MmMtMC4wMDktMC4xOTctMC4wMjQtMC4zOTQtMC4wNDUtMC41OXYtMTI4YzAtNi4yNjktMy42NTctMTIuNTM5LTkuNDA0LTEyLjUzOQ0KCQkJSDg1LjY4OHYtMjUuNmMwLTcwLjY5Miw1Ny4zMDgtMTI4LDEyOC0xMjhzMTI4LDU3LjMwOCwxMjgsMTI4djI1LjZoLTExLjQ5NGMtNS43NDcsMC05LjQwNCw2LjI2OS05LjQwNCwxMi41Mzl2MTI4DQoJCQljLTAuNTgzLDUuNDUxLDMuMzYzLDEwLjM0Myw4LjgxNCwxMC45MjZjMC4xOTYsMC4wMjEsMC4zOTMsMC4wMzYsMC41OSwwLjA0NWgxMi4wMTZsLTEuMDQ1LDEuNTY3DQoJCQljLTE1LjY3NywyMC44MzUtNDAuMjc3LDMzLjAzOC02Ni4zNTEsMzIuOTE0Yy01LjcwOC0yNy45ODktMzMuMDI2LTQ2LjA1Mi02MS4wMTUtNDAuMzQzDQoJCQljLTIzLjkzNSw0Ljg4MS00MS4xOTIsMjUuODQzLTQxLjM4NSw1MC4yN2MwLjI4NiwyOC42NSwyMy41OTQsNTEuNzI0LDUyLjI0NSw1MS43MjJjMTQuMTgzLTAuMjMsMjcuNzAyLTYuMDUsMzcuNjE2LTE2LjE5Ng0KCQkJYzYuNjg5LTYuODUsMTEuMDcyLTE1LjYxNywxMi41MzktMjUuMDc4YzMyLjY1MiwwLjEyNCw2My40NDUtMTUuMTc2LDgzLjA2OS00MS4yNzNsOS45MjctMTQuNjI5DQoJCQljMjIuNDY1LTEuNTY3LDM2LjU3MS0xNS42NzMsMzYuNTcxLTM2LjA0OXYtNjUuMzA2QzQwNC4zODIsMjAxLjE0MywzODcuNjY0LDE3NC40OTgsMzYzLjYzMSwxNzQuNDk4eiBNODUuNjg4LDMwNS4xMUg1OC41MjENCgkJCWMtMTEuMjUtMC4yNzQtMjAuMTQ4LTkuNjE1LTE5Ljg3NC0yMC44NjVjMC4wMDUtMC4xODUsMC4wMTItMC4zNywwLjAyMS0wLjU1NnYtNjUuMzA2YzAtMTIuMDE2LDguMzU5LTIyLjk4OCwxOS44NTMtMjIuOTg4DQoJCQloMjcuMTY3VjMwNS4xMXogTTI0Ny4xMjUsMzkxLjMxNGMtNS43OSw2LjI3OC0xMy45MjUsOS44NzMtMjIuNDY1LDkuOTI3Yy0xNi45OTgtMC4yNy0zMC43OTItMTMuODM0LTMxLjM0Ny0zMC44MjUNCgkJCWMtMC4wMDctMTcuMDI0LDEzLjc4OC0zMC44MywzMC44MTItMzAuODM3YzE3LjAyNC0wLjAwNywzMC44MywxMy43ODgsMzAuODM3LDMwLjgxMmMwLDAuMDA4LDAsMC4wMTcsMCwwLjAyNQ0KCQkJQzI1NS4zOTcsMzc4LjE3MywyNTIuNTUzLDM4NS43NTYsMjQ3LjEyNSwzOTEuMzE0eiBNMzgzLjQ4NCwyODguOTE0YzAsMTQuMTA2LTEzLjU4NCwxNi4xOTYtMTkuODUzLDE2LjE5NmgtMjEuOTQzVjE5NS4zOTYNCgkJCWgyMS45NDNjMTEuNDk0LDAsMTkuODUzLDE2LjE5NiwxOS44NTMsMjguMjEyVjI4OC45MTR6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo="
const ICON_CART = "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTEyLjAwMyA1MTIuMDAzIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMi4wMDMgNTEyLjAwMyIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJtNTAzLjk5NSAxMDUuMzczYy02Ljg2OC04LjQ5OC0xNy4wNzYtMTMuMzcxLTI4LjAwNC0xMy4zNzFoLTM5MC4yNTRsLTMuNDg1LTI0Ljk3NmMtMi40NjgtMTcuNjg2LTE3Ljc5Ni0zMS4wMjQtMzUuNjU1LTMxLjAyNGgtMzAuNTk3Yy04LjgzNiAwLTE2IDcuMTY0LTE2IDE2czcuMTY0IDE2IDE2IDE2aDMwLjU5N2MxLjk4NCAwIDMuNjg4IDEuNDgyIDMuOTYxIDMuNDQ3bDQzLjE4OSAzMDkuNTI5YzIuNDY4IDE3LjY4NyAxNy43OTYgMzEuMDI0IDM1LjY1NSAzMS4wMjRoMTcuMzQ5Yy0xLjc3NiA1LjAwOC0yLjc1MiAxMC4zOTEtMi43NTIgMTYgMCAyNi40NjcgMjEuNTMzIDQ4IDQ4IDQ4czQ4LTIxLjUzMyA0OC00OGMwLTUuNjA5LS45NzYtMTAuOTkyLTIuNzUyLTE2aDg1LjUwNGMtMS43NzYgNS4wMDgtMi43NTIgMTAuMzkxLTIuNzUyIDE2IDAgMjYuNDY3IDIxLjUzMyA0OCA0OCA0OHM0OC0yMS41MzMgNDgtNDhjMC01LjYwOS0uOTc2LTEwLjk5Mi0yLjc1Mi0xNmgzNC43NTNjOC44MzYgMCAxNi03LjE2NCAxNi0xNnMtNy4xNjQtMTYtMTYtMTZoLTMxOC41OTdjLTEuOTg0IDAtMy42ODgtMS40ODItMy45NjEtMy40NDdsLTMuOTg0LTI4LjU1M2gzMTUuMTAyYzE2Ljg1OCAwIDMxLjY2My0xMS45NjUgMzUuMjA1LTI4LjQ1OGwzOS40MjktMTgzLjk5N2MyLjI5MS0xMC42ODEtLjMzMy0yMS42NzktNy4xOTktMzAuMTc0em0tMjk1Ljk5NSAzMjIuNjI5YzAgOC44MjItNy4xNzggMTYtMTYgMTZzLTE2LTcuMTc4LTE2LTE2IDcuMTc4LTE2IDE2LTE2IDE2IDcuMTc3IDE2IDE2em0xNzYgMGMwIDguODIyLTcuMTc4IDE2LTE2IDE2cy0xNi03LjE3OC0xNi0xNiA3LjE3OC0xNiAxNi0xNiAxNiA3LjE3NyAxNiAxNnptOTUuOTA1LTI5OS4xNjMtMzkuNDI4IDE4My45OTNjLS4zOTQgMS44MzYtMi4wNDIgMy4xNjktMy45MTcgMy4xNjloLTMxOS41NjhsLTI2Ljc5LTE5MmgzODUuNzg4YzEuNTgzIDAgMi41NjkuODA4IDMuMTE3IDEuNDg2LjU0Ny42NzcgMS4xMjkgMS44MDguNzk4IDMuMzUyeiIvPjwvZz48L3N2Zz4="
export default {
  name: 'Product',
  components: {
    /* 组件名称用首字母大写, template 里面标签不能用大写, 全部用小写+减号 */
    RelatedProducts,
    SelectVariants
  },
  data() {
    /* getCurrentInstance 只在生命周期方法里用, 一般在 created() 或者 data() 方法里面用 */
    const { id, name } = getCurrentInstance().router.params
    /* 服务器端取下来的数据放入 this.[propertyName] 以后, 其他处理过的数据不要放进 this.[propertyName], 直接放在 this 下面,
    data() 方法返回的属性和本地变量名称用驼峰, 其他 object 的 key 不做限制 */
    return {
      ICON_CUSTOMER_SERVIDE,
      ICON_CART,
      pending: true,
      productId: id,
      productName: name,
      product: {
        variants: []
      },
      drawerOpenedType: '',
      currentVariant: {},
      miniqrUrl: ''
    }
  },
  created() {
  },
  async mounted() {
    await this.fetchProduct()
  },
  computed: {
    ...mapState('cart', {
      cart: (state) => state
    }),
    ...mapState('customer', {
      customer: (state) => state.data || {},
    }),
    body_html () {
      return _.get(this.product, 'body_html_mobile') || _.get(this.product, 'body_html')
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    /* 方法名称用驼峰 */
    async fetchProduct() {
      // TODO 要处理 404
      const fields = _.join(['id', 'title', 'image', 'variants', 'price', 'created_at'], ',')
      let product = null
      if (this.productId) {
        const res = await API.get(`/shopfront/product/${this.productId}/`, {
          params: { fields }
        }).catch(err => {
          console.log(err)
        })
        product = res.data
      } else if (this.productName) {
        /* 不要拼接 url, 用 params */
        const res = await API.get('/shopfront/product/', {
          params: { fields, name: this.productName }
        }).catch(err => {
          console.log(err)
        })
        /* res.data.results 一定是数组不会有问题, 只需要看长度就行 */
        product = res.data.results[0]
      }
      if (product) {
        this.product = product
        this.productId = product.id
        const variant = _.find(product.variants || [], { is_available: true }) || product.variants[0]
        this.currentVariant = variant
      } else {
        // 抛出异常
      }
    },
    onToggleSelectVariant (status) {
      this.drawerOpenedType = (typeof status === 'undefined') ? 'add_to_cart' : status
    },
    onSelectVariant (variantId) {
      if (!variantId || variantId === this.currentVariant.id) return
      this.currentVariant = _.find(this.product.variants || [], { id: variantId })
    },
    onNavigateToCart () {
      Taro.switchTab({ url: '/pages/cart/index' })
    },
  }
}
</script>

<style lang="scss">
/* Taro vue 版本不支持 scoped, 只能用 cssModule, 这里不要写 scoped, 平时注意 class 冲突 */
$color-orange: #ff5a00;
$color-text-light: #999999;
$color-text-lighter: #969aa1;
$btn-blue: #284179;
$btn-orange: #ff5a00;
$color-border: #ecf0f1;

.page {
  min-height: 100vh;
  background-color: #f6f6f6;
  padding-bottom: 50px;
  position: relative;
  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    width: 100%;
    padding: 7px 10px;
    background-color: #ffffff;
    box-shadow: 0 -1px 0 0 $color-border;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  &__footer__left,
  &__footer__right {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  &__footer__left {
  }
  &__footer__right {
    margin-left: 15px;
    flex: 1;
  }
  &__footer__icon-btn {
    padding: 0;
    margin: 0;
    background-color: transparent;
    outline: none;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 40px;
    position: relative;
  }
  &__footer__icon-btn::after {
    display: none;
  }
  &__footer__icon-btn + &__footer__icon-btn {
    margin-left: 10px;
  }
  &__footer__icon-btn__icon {
    width: 16px;
    height: 16px;
  }
  &__footer__icon-btn__text {
    font-size: 10px;
    margin-top: 4px;
    line-height: 10px;
    white-space: nowrap;
  }
  &__footer__icon-btn--cart__count {
    font-size: 10px;
    background-color: $color-orange;
    color: #ffffff;
    line-height: 10px;
    padding: 2px;
    min-width: 14px;
    text-align: center;
    border-radius: 7px;
    position: absolute;
    top: -5px;
    left: 55%;
  }
  &__footer__btn {
    width: 48%;
    height: 36px;
    line-height: 36px;
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    color: #ffffff;
    border-radius: 18px;
  }
  &__footer__btn.btn--orange {
    background-color: $btn-orange;
  }
  &__footer__btn.btn--blue {
    background-color: $btn-blue;
  }
  &__footer__btn:hover,
  &__footer__btn:active {
    opacity: 0.9;
  }
  &__footer__btn__text {
    font-size: 13px;
  }
}
.page__section {
  background-color: #ffffff;
  & + & {
    margin-top: 10px;
  }
  &__title {
    padding: 10px;
    text-align: center;
    line-height: 40px;
    font-size: 15px;
    font-weight: bold;
  }
}
.cell {
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  &__label {
    margin-right: 20px;
  }
  &__value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__ft {
    margin-left: 20px;
  }
  & + & {
    border-top: 1px solid #f6f6f6;
  }
}

.product-image-bg {
  width: 100px;
  height: 100px;
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
  padding: 15px;
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
  color: $btn-orange;
  &__currency {
    font-size: 12px;
    line-height: 1;
  }
  &__value {
    font-size: 20px;
    line-height: 1;
    font-weight: bold;
  }
}
.product__compare-at-price {
  color: $color-text-lighter;
  text-decoration: line-through;
  margin-left: 3px;
  &__currency {
    font-size: 11px;
    line-height: 1;
  }
  &__value {
    font-size: 14px;
    line-height: 1;
    font-weight: bold;
  }
}
.product__add-to-wishlist {
  font-size: 11px;
}

/* 标题和描述 */
.product__title {
  padding: 5px 15px;
  font-size: 15px;
  font-weight: bolder;
  text-align: justify;
  line-height: 1.6;
}
.product__description {
  padding: 5px 15px;
  font-size: 12px;
  color: $color-text-light;
  text-align: justify;
}
.cell__ft__icon {
  width: 10px;
  height: 12px;
}
.product__html {
  padding: 0 15px;
}

.product__share {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 50%;
  &__icon {
    width: 20px;
    height: 20px;
  }
}
</style>
