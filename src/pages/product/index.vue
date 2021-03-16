<template>
  <view
    :class="{[$style['page']]: true, [$style['pageIphoneX']]: isLikeIphoneX}"
    :style="$globalColors"
  >

    <template v-if="product.id">
      <!--
      <product-single-buy :product="product" :variant.sync="currentVariant"></product-single-buy>
      <product-single-accessories :product="product" :variant.sync="currentVariant"></product-single-accessories>
      <product-single-body-html :product="product" :variant.sync="currentVariant"></product-single-body-html>
      <product-single-related :product="product" :variant.sync="currentVariant"></product-single-related>
      -->
      <component
        v-for="(block, index) in blocks" :key="index"
        :is="block.componentClass"
        :css="block.css" :settingsData="block.settings_data"
        :id="'block--' + block.id"
        :product="product" :variant.sync="currentVariant"
      ></component>
      <!-- product 和 variant 是这个页面特有的属性, 组件不需要就不接收就行了 -->
    </template>
    <view v-else :class="$style['productLoadingPlaceholder']">
      <text class="el-icon-loading"></text>
    </view>

    <!-- 以上为可配置板块 -->

    <!-- 暂时隐藏评论板块
    <view :class="$style['pageSection']" v-if="product.id">
      <product-reviews :productId="product.id"/>
    </view>
    -->

    <!-- 底部菜单 -->

    <template v-if="product.id">
      <view :class="$style['footer']" v-if="tezignShareEnabled">
        <button
          :class="['button', 'button--primary', 'button--small']"
          :style="{'display':'block', 'width':'100%'}"
          @tap="tezignShareDialogVisible = true"
        >分享到朋友圈领取</button>
      </view>
      <view :class="$style['footer']" v-else>
        <button :class="['button', $style['iconBtn'], $style['footerIconBtn']]" open-type="contact">
          <view class="el-icon-headset"></view>
          <view :class="$style['iconBtnText']">客服</view>
        </button>
        <navigator :class="[$style['iconBtn'], $style['footerIconBtn']]" url="/pages/cart/index" open-type="switchTab">
          <view class="el-icon-shopping-cart-2"></view>
          <view :class="$style['iconBtnText']">购物车</view>
          <text
            v-if="cart.totalCount" :class="$style['footerIconBtnCartCount']"
          >{{ cart.totalCount > 10 ? '10+' : cart.totalCount }}</text>
        </navigator>
        <button
          :class="[$style['footerBtn'], 'button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
          @tap="() => showVariantsDrawer('add_to_cart')"
        >加入购物车</button>
        <button
          :class="[$style['footerBtn'], 'button', 'button--primary', 'button--small', 'button--round']"
          @tap="() => showVariantsDrawer('buy_now')"
        >立即购买</button>
      </view>
    </template>

    <!-- 以下为悬浮组件 -->
    <select-variant
      :visible.sync="variantsDrawer.visible"
      :openType="variantsDrawer.openType"
      :product="product"
      :variant="currentVariant"
      @selectVariant="onSelectVariant"
      @close="onVariantsDrawerClosed"
    ></select-variant>

    <tezign-share-dialog :visible.sync="tezignShareDialogVisible"></tezign-share-dialog>

  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import ThemeBlocks from '@/mixins/ThemeBlocks'
import Price from '@/components/Price'
import SelectVariant from '@/components/SelectVariant/SelectVariant'
import TezignShareDialog from './TezignShareDialog'
import ProductReviews from './ProductReviews'

export default {
  name: 'Product',
  components: {
    /* 组件名称用首字母大写, template 里面标签不能用大写, 全部用小写+减号 */
    ProductReviews,
    SelectVariant,
    Price,
    TezignShareDialog,
  },
  mixins: [
    ThemeBlocks  // 会在页面上产生 blocks, pageType 和 pageName 三个变量
  ],
  data() {
    /* 服务器端取下来的数据放入 this.[propertyName] 以后, 其他处理过的数据不要放进 this.[propertyName], 直接放在 this 下面,
    data() 方法返回的属性和本地变量名称用驼峰, 其他 object 的 key 不做限制 */
    return {
      product: {
        variants: []
      },
      variantsDrawer: {
        visible: false,
        openType: ''
      },
      currentVariant: {},
      tezignShareEnabled: getCurrentInstance().router.params['tezign-share'] == '1',
      tezignShareDialogVisible: false,
      // TODO, 现在这个 pending 没用上
      pending: true,
    }
  },
  created() {
    // Taro.setBackgroundColor({
    //   backgroundColorTop: '#ffffff',
    //   backgroundColor: '#f6f6f6',
    //   backgroundColorBottom: '#f6f6f6',
    // })
  },
  mounted() {
    /* getCurrentInstance 只在生命周期方法里用, 一般在 created() 或者 data() 方法里面用 */
    const { id, name } = getCurrentInstance().router.params
    this.fetchProduct({ productId: id, productName: name })
    this.fetchPageConfig('product')
  },
  computed: {
    ...mapState(['cart', 'customer']),
    ...mapGetters('system', ['isLikeIphoneX']),
  },
  onShareAppMessage() {
    // this.customer.isAuthenticated
    if (!this.product.id) {
      // 还没有 fetch 完
      return {}
    }
    let shareScene = `r=pdt&id=${this.product.id}`
    if (this.customer.isAuthenticated) {
      const referralCode = this.customer.data.referral_code
      shareScene += `&s=share&c=${referralCode}`
    }
    return {
      title: this.product.title,
      path: `/pages/home?scene=${encodeURIComponent(shareScene)}`,
      imageUrl: this.optimizeImage(this.product.image, 400),
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    _initializeCurrentVariant(product) {
      const { variant: variantIdInParams } = getCurrentInstance().router.params
      if (this.currentVariant.id) {
        //
      } else if (+variantIdInParams) {
        const variant = _.find(product.variants, { id: +variantIdInParams })
        this.currentVariant = variant
      } else {
        const variant = _.find(product.variants, { is_available: true }) || product.variants[0]
        this.currentVariant = variant
      }
    },
    /* 方法名称用驼峰 */
    async fetchProduct({ productId, productName } = {}) {
      // TODO 要处理 404
      const fields = [
        'id', 'title', 'description', 'image', 'images', 'variants', 'options',
        'body_html', 'body_html_mobile', 'published', 'published_at', 'metafields'
      ].join(',')
      let product = null
      if (productId) {
        try {
          const res = await API.get(`/shopfront/product/${productId}/`, {
            params: { fields }
          })
          product = res.data
        } catch(err) { console.log(err) }
      } else if (productName) {
        /* 不要拼接 url, 用 params */
        try {
          const res = await API.get('/shopfront/product/', {
            params: { fields, name: productName }
          })
          product = res.data.results[0]
        } catch(err) { console.log(err) }
        /* res.data.results 一定是数组不会有问题, 只需要看长度就行 */
      }
      if (product) {
        this._initializeCurrentVariant(product)
        this.product = product
        // 注意, 一定要先设置 currentVariant 在设置 product.id, 确保 product.id 存在的时候 currentVariant 一定可用
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
    onSelectVariant(variantId, quantity) {
      // console.log(variantId, quantity)
      if (!variantId || variantId === this.currentVariant.id) return
      this.currentVariant = _.find(this.product.variants || [], { id: variantId })
    },
    onVariantsDrawerClosed() {
      // 这里什么都不用做, visible 是通过 sync 修饰符直接修改的, 如果没有加 sync 才需要下面这一句
      // // 这里一定要监听 close 然后把 visible 变成 false, 不然再点击打开, 组件检测不到变化
      // this.variantsDrawer = { visible: false, openType: '' }
    },
    showRebateTip() {
      Taro.showModal({
        title: '立赚说明',
        content: '成为 HeyShop 国货大使后，无论是自购或是分享商品，均可获得返现哦！',
        showCancel: false
      })
    },
  },
  async onPullDownRefresh() {
    await this.fetchProduct({ productId: this.product.id})
    Taro.stopPullDownRefresh()
  }
}
</script>

<style lang="scss" module>
/* Taro vue 版本不支持 scoped, 只能用 cssModule, 这里不要写 scoped, 平时注意 class 冲突 */
@import '@/styles/mixins';
@import '@/styles/variables';
.page {
  overflow: hidden;
  padding-bottom: 50px;
  position: relative;
}
.page.pageIphoneX {
  padding-bottom: 65px;
}
.productLoadingPlaceholder {
  font-size: 20px;
  text-align: center;
  padding: 30px 15px;
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
  .page.pageIphoneX & {
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
  background-color: var(--color-primary);
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
</style>
