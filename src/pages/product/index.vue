<template>
  <view :class="{[$style['page']]: true, [$style['pageIphoneX']]: isLikeIphoneX}">
    <view :class="$style['pageSection']">
      <swiper
        :class="$style['productImages']"
        indicatorColor='#999' indicatorActiveColor='#333' :indicatorDots="true"
        :circular="true" :interval="5000" :autoplay="true"
      >
        <swiper-item :class="$style['productImagesSwiperItem']" v-for="(image, index) in product.images" :key="image.id">
          <image :class="$style['productImagesSwiperItemImage']" mode="aspectFit" :src="optimizeImage(image, 400)" @tap="() => previewImage(product.images, index, 'src')"></image>
        </swiper-item>
      </swiper>
      <!-- 商品价格和添加心愿单 -->
      <view :class="$style['productHeader']">
        <price
          :class="$style['productPrice']" :highlight="true" :keepZero="true"
          :price="currentVariant.price" :compareAtPrice="currentVariant.compare_at_price"
        ></price>
        <view :class="[$style['iconBtn'], $style['iconBtnFavorite']]" @tap="addToFavorite">
          <view
            :class="{'el-icon-star-on': !!favoriteId, 'el-icon-star-off': !favoriteId}"
            :style="{color: favoriteId ? '#ffd700' : 'inherit'}"
          ></view>
          <view :class="$style['iconBtnText']">心愿单</view>
        </view>
      </view>
      <!-- 商品标题和描述 -->
      <view :class="$style['productTitle']">{{ product.title }}</view>
      <view :class="$style['productDescription']">{{ product.description }}</view>
      <view :class="$style['productTags']" v-if="rebateValue">
        <view :class="[$style['tag'], $style['tagOrange']]">立赚 {{ rebateValue }}</view>
        <view :class="[$style['tag'], $style['tagGold']]" v-if="growthValue">
          <text class="el-icon-star-on" style="font-size: 1.2em;"></text>成长值 {{ growthValue }}
        </view>
        <view :class="$style['tip']" @tap="showRebateTip">?</view>
      </view>
    </view>
    <view :class="$style['pageSection']" v-if="!hideSelectedVariant">
      <view :class="$style['cell']" @tap="() => showVariantsDrawer('')">
        <view :class="$style['cellLabel']">已选</view>
        <view :class="$style['cellValue']">{{ currentVariant.title }}</view>
        <view :class="$style['cellFt']">
          <image :class="$style['cellFtIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
        </view>
      </view>
    </view>
    <view :class="$style['pageSection']" v-if="product.id">
      <product-reviews :productId="product.id"/>
    </view>
    <view :class="$style['pageSection']" v-if="body_html">
      <view :class="$style['pageSectionTitle']">图文详情</view>
      <!-- <view v-if="body_html" class="'taro_html'" :class="$style['productHtml']" v-html="body_html"></view> -->
      <wxparse :html="body_html" />
    </view>
    <!-- 猜你喜欢这个板块不要 pageSection -->
    <related-products v-if="productId" :productId="productId"/>
    <view :class="{[$style['footer']]: true, [$style['isLikeIphoneX']]: isLikeIphoneX}">
      <button :class="['button', $style['iconBtn'], $style['footerIconBtn']]" open-type="contact">
        <view class="el-icon-headset"></view>
        <view :class="$style['iconBtnText']">客服</view>
      </button>
      <navigator :class="[$style['iconBtn'], $style['footerIconBtn']]" url="/pages/cart/index" open-type="switchTab">
        <view class="el-icon-shopping-cart-2"></view>
        <view :class="$style['iconBtnText']">购物车</view>
        <text v-if="cart.totalCount" :class="$style['footerIconBtnCartCount']">{{ cart.totalCount > 10 ? '10+' : cart.totalCount }}</text>
      </navigator>
      <button
        :class="[$style['footerBtn'], 'button', 'button--blue', 'button--small', 'button--round']"
        @tap="() => showVariantsDrawer('add_to_cart')"
      >加入购物车</button>
      <button
        :class="[$style['footerBtn'], 'button', 'button--orange', 'button--small', 'button--round']"
        @tap="() => showVariantsDrawer('buy_now')"
      >立即购买</button>
    </view>
    <view v-if="partnerLevel > 0"
      :class="{[$style['productShare']]: true, [$style['isLikeIphoneX']]: isLikeIphoneX}"
      @tap="onClickShare">
      <!-- <text class="el-icon-share"></text> -->
      <image :class="$style['productShareIcon']" src="https://up.img.heidiancdn.com/o_1eivho00dova1ua417h2f8hl5q0hape2x.png" mode="aspectFit" lazy-load="false"></image>
      <text :class="$style['productShareText']">立赚</text>
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
// import '@tarojs/taro/html.css'
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'
import SelectVariant from '@/components/SelectVariant/SelectVariant'
import RelatedProducts from './RelatedProducts'
import ProductReviews from './ProductReviews'

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
      favoriteId: null,
      pending: true
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  async mounted() {
    await this.fetchProduct()
    this.checkFavorite()
  },
  computed: {
    ...mapState(['cart', 'customer', 'partnerProfile']),
    ...mapGetters('system', ['isLikeIphoneX']),
    partnerLevel () {
      return +this.partnerProfile.data.level || 0
    },
    hideSelectedVariant () {
      return _.isEmpty(_.get(this.product, 'options'))
    },
    body_html() {
      return _.get(this.product, 'body_html_mobile') || _.get(this.product, 'body_html')
    },
    rebateValue() {
      const rebateRate = _.get(this.product, 'metafields.substores.rebate_rate')
      if (rebateRate && this.currentVariant) {
        return +(+rebateRate * +this.currentVariant.price).toFixed(2)
      }
    },
    growthValue() {
      return _.get(this.product, 'metafields.substores.growth_value')
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    /* 方法名称用驼峰 */
    async fetchProduct() {
      // TODO 要处理 404
      const fields = [
        'id', 'title', 'description', 'image', 'images', 'variants', 'options',
        'body_html', 'body_html_mobile', 'published', 'published_at', 'metafields'
      ].join(',')
      let product = null
      if (this.productId) {
        try {
          const res = await API.get(`/shopfront/product/${this.productId}/`, {
            params: { fields }
          })
          product = res.data
        } catch(err) { console.log(err) }
      } else if (this.productName) {
        /* 不要拼接 url, 用 params */
        try {
          const res = await API.get('/shopfront/product/', {
            params: { fields, name: this.productName }
          })
          product = res.data.results[0]
        } catch(err) { console.log(err) }
        /* res.data.results 一定是数组不会有问题, 只需要看长度就行 */
      }
      if (product) {
        this.product = product
        this.productId = product.id
        const variant = _.find(product.variants || [], { is_available: true }) || product.variants[0]
        this.currentVariant = variant
        Taro.setNavigationBarTitle({
          title: product.title
        })
      } else {
        Taro.showModal({
          title: '找不到商品',
          content: '商品链接错误',
          showCancel: false
        })
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
    // onNavigateToCart() {
    //   Taro.switchTab({ url: '/pages/cart/index' })
    // },
    onClickShare() {
      Taro.navigateTo({ url: `/pages/misc/share?product=${this.product.id}` })
    },
    addToFavorite: _.throttle(async function() {
      if (!this.customer.isAuthenticated) {
        Taro.navigateTo({ url: '/pages/login/index' })
        return
      }
      if (this.favoriteId) {
        try {
          await API.delete(`/customers/favorite/${this.favoriteId}/`)
          this.favoriteId = null
        } catch(err) { console.log(err) }
      } else {
        try {
          this.favoriteId = '0'  // 这么放一个假 id 让 UI 上的收藏标记立即变亮
          const { data } = await API.post('/customers/favorite/', {
            'owner_resource': 'product',
            'owner_id': this.productId,
            'subscribe': true
          })
          this.favoriteId = data.id
        } catch(err) { console.log(err) }
      }
    }, 2000),
    async checkFavorite() {
      if (this.customer.isAuthenticated) {
        const { data } = await API.get('/customers/favorite/', {
          params: {
            product: this.productId,
            fields: 'id'
          }
        })
        this.favoriteId = _.get(data, 'results[0].id', null)
      }
    },
    showRebateTip() {
      Taro.showModal({
        title: '立赚说明',
        content: '成为 HeyShop 会员/国货大使后，无论是自购或是分享商品，均可获得返现哦！',
        showCancel: false
      })
    },
    previewImage (images, index, key) {
      Taro.previewImage({
        current: index,
        urls: _.map(images, `${key}`)
      })
    }
  },
  async onPullDownRefresh () {
    await this.fetchProduct()
    await this.checkFavorite()
    Taro.stopPullDownRefresh()
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
  overflow: hidden;
  padding-bottom: 50px;
  position: relative;
}
.page.pageIphoneX {
  padding-bottom: 65px;
}
.iconBtn {
  width: 30px;
  height: 30px;
  line-height: 1;
  text-align: center;
  padding: 0;
  color: $color-text;
  background-color: transparent;
  outline: none;
  &::after {
    display: none;
  }
  [class^="el-icon-"] {
    font-size: 20px;
    height: 20px;
    overflow: hidden;
    display: block;
  }
  .iconBtnText {
    font-size: 10px;
    height: 10px;
    overflow: hidden;
    display: block;
    white-space: nowrap;
  }
}
.iconBtnFavorite {
  height: auto;
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
  &.isLikeIphoneX {
    height: 65px;
    padding-bottom: 22px;
  }
}
.footerBtn {
  margin-left: 10px;
  flex: 1;
}
.footerIconBtn {
  margin-right: 10px;
  position: relative;
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
  padding: 10px 15px;
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
.productDescription,
.productTags {
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
  display: flex;
  align-items: baseline;
  font-size: 20px;
  :global(.price--compare) {
    margin-left: 10px;
    font-size: 0.6em;
  }
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
.productTags {
  margin: 15px auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .tag {
    padding: 0 8px;
    font-size: 12px;
    line-height: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    margin-right: 10px;
  }
  .tagOrange {
    background-color: $color-orange;
    color: #fff;
  }
  .tagGold {
    background-image: linear-gradient(106deg, #e8cca7, #edd6b8 52%, #e6caa5 82%);
    color: #5c411a;
  }
  .tip {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    line-height: 14px;  // 因为有 border, line-height 要减去 2px
    font-size: 10px;
    text-align: center;
    border: 1px solid $color-text-lighter;
    color: $color-text-lighter;
  }
}

.cellFtIcon {
  width: 10px;
  height: 12px;
}
.productHtml {
  padding: 0 15px;
}

.productShare {
  position: fixed;
  bottom: 55px;
  right: 15px;
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: $color-text;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 1px 5px 0px #aaaaaa;
  font-size: 18px;
  line-height: 20px;
  color: #ffffff;
  &.isLikeIphoneX {
    bottom: 70px;
  }
  &Icon {
    width: 14px;
    height: 14px;
  }
}
.productShareText {
  font-size: 9px;
  line-height: 12px;
}
</style>
