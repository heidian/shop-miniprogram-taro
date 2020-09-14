<template>
  <view :class="$style['page']">
    <view :class="$style['pageSection']">
      <swiper
        :class="$style['productImages']"
        indicatorColor='#999'
        indicatorActiveColor='#333'
        circular
        :indicatorDots="true"
        interval="5000"
        autoplay
      >
        <swiper-item :class="$style['productImagesSwiperItem']" v-for="image in product.images" :key="image.id">
          <image :class="$style['productImagesSwiperItemImage']" mode="aspectFit" :src="optimizeImage(image, 600)"></image>
        </swiper-item>
      </swiper>
      <!-- 商品价格和添加心愿单 -->
      <view :class="$style['productHeader']">
        <price
          :class="$style['productPrice']" :highlight="true" :keepZero="false"
          :price="currentVariant.price" :compareAtPrice="currentVariant.compare_at_price"
        ></price>
        <view :class="$style['addToWishlist']">
          心愿单
        </view>
      </view>
      <!-- 商品标题和描述 -->
      <view :class="$style['productTitle']">{{ product.title }}</view>
      <view :class="$style['productDescription']">{{ product.description }}</view>
    </view>
    <!-- 待删除 -->
    <!-- 待删除 -->
    <view :class="$style['pageSection']">
      <view :class="$style['cell']" @tap="() => showVariantsDrawer('')">
        <view :class="$style['cellLabel']">已选</view>
        <view :class="$style['cellValue']">{{ currentVariant.title }}</view>
        <view :class="$style['cellFt']">
          <image :class="$style['cellFtIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
        </view>
      </view>
    </view>
    <view :class="$style['pageSection']" v-if="showReviews && product.id">
      <product-reviews
        :reviewsCaption="{}"
        :productId="product.id"
      />
    </view>
    <view :class="$style['pageSection']">
      <view :class="$style['pageSectionTitle']">图文详情</view>
      <view v-if="body_html" class="'taro_html'" :class="$style['productHtml']" v-html="body_html"></view>
    </view>
    <view :class="$style['pageSection']" v-if="productId">
      <view :class="$style['pageSectionTitle']">猜你喜欢</view>
      <related-products :productId="productId"/>
    </view>
    <view :class="$style['footer']">
      <button :class="$style['footerIconBtn']" openType="contact">
        <image :class="$style['footerIconBtnIcon']" mode="aspectFit" :src="ICON_CUSTOMER_SERVIDE"></image>
        <text :class="$style['footerIconBtnText']">客服</text>
      </button>
      <navigator url="/pages/cart/index" open-type="switchTab" :class="$style['footerIconBtn']">
        <image :class="$style['footerIconBtnIcon']" mode="aspectFit" :src="ICON_CART"></image>
        <text :class="$style['footerIconBtnText']">购物车</text>
        <text v-if="cart.totalCount" :class="$style['footerIconBtnCartCount']">{{ cart.totalCount > 10 ? '10+' : cart.totalCount }}</text>
      </navigator>
      <button
        :class="[$style['footerBtn'], 'button--blue', 'button--small', 'button--round']"
        @tap="() => showVariantsDrawer('add_to_cart')"
      >加入购物车</button>
      <button
        :class="[$style['footerBtn'], 'button--orange', 'button--small', 'button--round']"
        @tap="() => showVariantsDrawer('buy_now')"
      >立即购买</button>
    </view>
    <view :class="$style['productShare']" @tap="onClickShare">
      <image :class="$style['productShareIcon']" src="data:image/svg+xml;base64,PHN2ZyBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1NTEuMTMgNTUxLjEzIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDU1MS4xMyA1NTEuMTMiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTQ2NS4wMTYgMTcyLjIyOGgtNTEuNjY4djM0LjQ0NmgzNC40NDZ2MzEwLjAxMWgtMzQ0LjQ1N3YtMzEwLjAxMWgzNC40NDZ2LTM0LjQ0NmgtNTEuNjY5Yy05LjUyIDAtMTcuMjIzIDcuNzAzLTE3LjIyMyAxNy4yMjN2MzQ0LjQ1NmMwIDkuNTIgNy43MDMgMTcuMjIzIDE3LjIyMyAxNy4yMjNoMzc4LjkwMmM5LjUyIDAgMTcuMjIzLTcuNzAzIDE3LjIyMy0xNy4yMjN2LTM0NC40NTZjMC05LjUyLTcuNzAzLTE3LjIyMy0xNy4yMjMtMTcuMjIzeiIvPjxwYXRoIGQ9Im0yNTguMzQyIDY1LjkzMXYyNDQuMDhoMzQuNDQ2di0yNDQuMDhsNzMuOTM3IDczLjkzNyAyNC4zNTQtMjQuMzU0LTExNS41MTQtMTE1LjUxNC0xMTUuNTE0IDExNS41MTQgMjQuMzU0IDI0LjM1NHoiLz48L3N2Zz4=" mode="aspectFit" lazy-load="false"></image>
    </view>
    <select-variant
      :visible="variantsDrawer.visible"
      :openType="variantsDrawer.openType"
      :product="product"
      :variant="currentVariant"
      @selectVariant="onSelectVariant"
      @close="onCloseVariantsDrawer"
    ></select-variant>
  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import '@tarojs/taro/html.css'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import SelectVariant from '@/components/SelectVariant/SelectVariant'
import RelatedProducts from './RelatedProducts'
import ProductReviews from './ProductReviews'
import Price from '@/components/Price'

const ICON_CUSTOMER_SERVIDE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjEzOSA0MjIuMTM5IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuMTM5IDQyMi4xMzk7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNMzYzLjYzMSwxNzQuNDk4aC0xLjA0NXYtMjUuNkMzNjIuNTg2LDY2LjY2NCwyOTUuOTIzLDAsMjEzLjY4OCwwUzY0Ljc5LDY2LjY2NCw2NC43OSwxNDguODk4djI1LjZoLTYuMjY5DQoJCQljLTIyLjk4OCwwLTQwLjc1MSwyMC4zNzUtNDAuNzUxLDQzLjg4NnY2NS4zMDZjLTAuNTc5LDIyLjc4NywxNy40MjUsNDEuNzI5LDQwLjIxMiw0Mi4zMDhjMC4xOCwwLjAwNSwwLjM1OSwwLjAwOCwwLjUzOSwwLjAxDQoJCQloMzguNjYxYzUuNDc2LTAuMjU3LDkuNzA3LTQuOTA2LDkuNDQ5LTEwLjM4MmMtMC4wMDktMC4xOTctMC4wMjQtMC4zOTQtMC4wNDUtMC41OXYtMTI4YzAtNi4yNjktMy42NTctMTIuNTM5LTkuNDA0LTEyLjUzOQ0KCQkJSDg1LjY4OHYtMjUuNmMwLTcwLjY5Miw1Ny4zMDgtMTI4LDEyOC0xMjhzMTI4LDU3LjMwOCwxMjgsMTI4djI1LjZoLTExLjQ5NGMtNS43NDcsMC05LjQwNCw2LjI2OS05LjQwNCwxMi41Mzl2MTI4DQoJCQljLTAuNTgzLDUuNDUxLDMuMzYzLDEwLjM0Myw4LjgxNCwxMC45MjZjMC4xOTYsMC4wMjEsMC4zOTMsMC4wMzYsMC41OSwwLjA0NWgxMi4wMTZsLTEuMDQ1LDEuNTY3DQoJCQljLTE1LjY3NywyMC44MzUtNDAuMjc3LDMzLjAzOC02Ni4zNTEsMzIuOTE0Yy01LjcwOC0yNy45ODktMzMuMDI2LTQ2LjA1Mi02MS4wMTUtNDAuMzQzDQoJCQljLTIzLjkzNSw0Ljg4MS00MS4xOTIsMjUuODQzLTQxLjM4NSw1MC4yN2MwLjI4NiwyOC42NSwyMy41OTQsNTEuNzI0LDUyLjI0NSw1MS43MjJjMTQuMTgzLTAuMjMsMjcuNzAyLTYuMDUsMzcuNjE2LTE2LjE5Ng0KCQkJYzYuNjg5LTYuODUsMTEuMDcyLTE1LjYxNywxMi41MzktMjUuMDc4YzMyLjY1MiwwLjEyNCw2My40NDUtMTUuMTc2LDgzLjA2OS00MS4yNzNsOS45MjctMTQuNjI5DQoJCQljMjIuNDY1LTEuNTY3LDM2LjU3MS0xNS42NzMsMzYuNTcxLTM2LjA0OXYtNjUuMzA2QzQwNC4zODIsMjAxLjE0MywzODcuNjY0LDE3NC40OTgsMzYzLjYzMSwxNzQuNDk4eiBNODUuNjg4LDMwNS4xMUg1OC41MjENCgkJCWMtMTEuMjUtMC4yNzQtMjAuMTQ4LTkuNjE1LTE5Ljg3NC0yMC44NjVjMC4wMDUtMC4xODUsMC4wMTItMC4zNywwLjAyMS0wLjU1NnYtNjUuMzA2YzAtMTIuMDE2LDguMzU5LTIyLjk4OCwxOS44NTMtMjIuOTg4DQoJCQloMjcuMTY3VjMwNS4xMXogTTI0Ny4xMjUsMzkxLjMxNGMtNS43OSw2LjI3OC0xMy45MjUsOS44NzMtMjIuNDY1LDkuOTI3Yy0xNi45OTgtMC4yNy0zMC43OTItMTMuODM0LTMxLjM0Ny0zMC44MjUNCgkJCWMtMC4wMDctMTcuMDI0LDEzLjc4OC0zMC44MywzMC44MTItMzAuODM3YzE3LjAyNC0wLjAwNywzMC44MywxMy43ODgsMzAuODM3LDMwLjgxMmMwLDAuMDA4LDAsMC4wMTcsMCwwLjAyNQ0KCQkJQzI1NS4zOTcsMzc4LjE3MywyNTIuNTUzLDM4NS43NTYsMjQ3LjEyNSwzOTEuMzE0eiBNMzgzLjQ4NCwyODguOTE0YzAsMTQuMTA2LTEzLjU4NCwxNi4xOTYtMTkuODUzLDE2LjE5NmgtMjEuOTQzVjE5NS4zOTYNCgkJCWgyMS45NDNjMTEuNDk0LDAsMTkuODUzLDE2LjE5NiwxOS44NTMsMjguMjEyVjI4OC45MTR6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo="
const ICON_CART = "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTEyLjAwMyA1MTIuMDAzIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMi4wMDMgNTEyLjAwMyIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJtNTAzLjk5NSAxMDUuMzczYy02Ljg2OC04LjQ5OC0xNy4wNzYtMTMuMzcxLTI4LjAwNC0xMy4zNzFoLTM5MC4yNTRsLTMuNDg1LTI0Ljk3NmMtMi40NjgtMTcuNjg2LTE3Ljc5Ni0zMS4wMjQtMzUuNjU1LTMxLjAyNGgtMzAuNTk3Yy04LjgzNiAwLTE2IDcuMTY0LTE2IDE2czcuMTY0IDE2IDE2IDE2aDMwLjU5N2MxLjk4NCAwIDMuNjg4IDEuNDgyIDMuOTYxIDMuNDQ3bDQzLjE4OSAzMDkuNTI5YzIuNDY4IDE3LjY4NyAxNy43OTYgMzEuMDI0IDM1LjY1NSAzMS4wMjRoMTcuMzQ5Yy0xLjc3NiA1LjAwOC0yLjc1MiAxMC4zOTEtMi43NTIgMTYgMCAyNi40NjcgMjEuNTMzIDQ4IDQ4IDQ4czQ4LTIxLjUzMyA0OC00OGMwLTUuNjA5LS45NzYtMTAuOTkyLTIuNzUyLTE2aDg1LjUwNGMtMS43NzYgNS4wMDgtMi43NTIgMTAuMzkxLTIuNzUyIDE2IDAgMjYuNDY3IDIxLjUzMyA0OCA0OCA0OHM0OC0yMS41MzMgNDgtNDhjMC01LjYwOS0uOTc2LTEwLjk5Mi0yLjc1Mi0xNmgzNC43NTNjOC44MzYgMCAxNi03LjE2NCAxNi0xNnMtNy4xNjQtMTYtMTYtMTZoLTMxOC41OTdjLTEuOTg0IDAtMy42ODgtMS40ODItMy45NjEtMy40NDdsLTMuOTg0LTI4LjU1M2gzMTUuMTAyYzE2Ljg1OCAwIDMxLjY2My0xMS45NjUgMzUuMjA1LTI4LjQ1OGwzOS40MjktMTgzLjk5N2MyLjI5MS0xMC42ODEtLjMzMy0yMS42NzktNy4xOTktMzAuMTc0em0tMjk1Ljk5NSAzMjIuNjI5YzAgOC44MjItNy4xNzggMTYtMTYgMTZzLTE2LTcuMTc4LTE2LTE2IDcuMTc4LTE2IDE2LTE2IDE2IDcuMTc3IDE2IDE2em0xNzYgMGMwIDguODIyLTcuMTc4IDE2LTE2IDE2cy0xNi03LjE3OC0xNi0xNiA3LjE3OC0xNiAxNi0xNiAxNiA3LjE3NyAxNiAxNnptOTUuOTA1LTI5OS4xNjMtMzkuNDI4IDE4My45OTNjLS4zOTQgMS44MzYtMi4wNDIgMy4xNjktMy45MTcgMy4xNjloLTMxOS41NjhsLTI2Ljc5LTE5MmgzODUuNzg4YzEuNTgzIDAgMi41NjkuODA4IDMuMTE3IDEuNDg2LjU0Ny42NzcgMS4xMjkgMS44MDguNzk4IDMuMzUyeiIvPjwvZz48L3N2Zz4="
export default {
  name: 'Product',
  components: {
    /* 组件名称用首字母大写, template 里面标签不能用大写, 全部用小写+减号 */
    RelatedProducts,
    ProductReviews,
    SelectVariant,
    Price
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
      variantsDrawer: {
        visible: false,
        openType: ''
      },
      currentVariant: {},
      miniqrUrl: ''
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  async mounted() {
    await this.fetchProduct()
  },
  computed: {
    ...mapState('cart', {
      cart: (state) => state
    }),
    body_html () {
      return _.get(this.product, 'body_html_mobile') || _.get(this.product, 'body_html')
    },
    showReviews () {
      return true
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    /* 方法名称用驼峰 */
    async fetchProduct() {
      // TODO 要处理 404
      const fields = ['id', 'title', 'description', 'image', 'images', 'variants', 'options', 'created_at'].join(',')
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
    showVariantsDrawer(openType) {
      this.variantsDrawer = {
        visible: true,
        openType
      }
    },
    onSelectVariant(variantId) {
      if (!variantId || variantId === this.currentVariant.id) return
      this.currentVariant = _.find(this.product.variants || [], { id: variantId })
    },
    onCloseVariantsDrawer() {
      // 这里一定要监听 close 然后把 visible 变成 false, 不然再点击打开, 组件检测不到变化
      this.variantsDrawer = { visible: false, openType: '' }
    },
    onNavigateToCart () {
      Taro.switchTab({ url: '/pages/cart/index' })
    },
    onClickShare () {
      Taro.navigateTo({ url: `/pages/misc/share?product=${this.product.id}` })
    }
  }
}
</script>

<style lang="scss" module>
/* Taro vue 版本不支持 scoped, 只能用 cssModule, 这里不要写 scoped, 平时注意 class 冲突 */
@import '@/styles/mixins';
@import '@/styles/variables';
page {
  background-color: #f6f6f6;
}
.page {
  min-height: 100vh;
  padding-bottom: 50px;
  position: relative;
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  width: 100%;
  padding: 7px 10px;
  background-color: #ffffff;
  box-shadow: 0 -1px 0 0 $color-divider;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.footerBtn {
  margin-left: 10px;
  flex: 1;
}
.footerIconBtn {
  margin-right: 10px;
  width: 30px;
  padding: 0;
  background-color: transparent;
  outline: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  &::after {
    display: none;
  }
}
.footerIconBtnIcon {
  width: 16px;
  height: 16px;
}
.footerIconBtnText {
  font-size: 10px;
  margin-top: 4px;
  line-height: 10px;
  white-space: nowrap;
}
.footerIconBtnCartCount {
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
.pageSection {
  overflow: hidden;
  background-color: #ffffff;
  & + & {
    margin-top: 10px;
  }
}
.pageSectionTitle {
  padding: 10px;
  text-align: center;
  line-height: 40px;
  font-size: 15px;
  font-weight: bold;
}
.cell {
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  & + & {
    border-top: 1px solid #f6f6f6;
  }
}
.cellLabel {
  margin-right: 20px;
}
.cellValue {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cellFt {
  margin-left: 20px;
}

.productImageBg {
  width: 100px;
  height: 100px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

/* Images Swiper */
.productImages {
  width: 100vw;
  height: 100vw;
}
.productImagesSwiperItemImage {
  width: 100%;
  height: 100%;
}

.productHeader,
.productTitle,
.productDescription {
  width: 100%;
  padding-left: 15px;
  padding-right: 15px;
}
.productHeader {
  width: 100%;
  margin: 15px auto 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.productPrice {
  font-size: 20px;
  :global(.price--compare) {
    font-size: 0.6em;
  }
}
.addToWishlist {
  font-size: 11px;
}
/* 标题和描述 */
.productTitle {
  margin: 5px auto;
  font-size: 16px;
  font-weight: bolder;
  text-align: justify;
  line-height: 1.6;
}
.productDescription {
  margin: 5px auto 15px;
  font-size: 13px;
  // color: $color-text-light;
  opacity: 0.9;
  text-align: justify;
}
.cellFtIcon {
  width: 10px;
  height: 12px;
}
.productHtml {
  padding: 0 15px;
}

.productShare {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 5px 0px #aaaaaa;
  &Icon {
    width: 20px;
    height: 20px;
  }
}
</style>
