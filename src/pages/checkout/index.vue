<template>
  <view :class="$style['page']" :style="$globalColors">
    <!-- <view class="section">drawerVisible: {{ couponCodesDrawerVisible }}</view> -->
    <view :class="[$style['section'], $style['shippingAddressSummary']]" @tap="goToAddress">
      <view v-if="getField('shipping_address')">
        <view :class="$style['area']">{{ getField('shipping_address.province') }} {{ getField('shipping_address.city') }} {{ getField('shipping_address.district') }}</view>
        <view :class="$style['address']">{{ getField('shipping_address.address1') }}{{ getField('shipping_address.address2') }}</view>
        <view :class="$style['contact']">{{ getField('shipping_address.full_name') }} {{ getField('shipping_address.mobile') }}</view>
      </view>
      <view v-else>
        <text class="el-icon-circle-plus-outline" style="margin-right: 10px"></text>
        <text>添加收货地址</text>
      </view>
      <view :class="$style['caret']" style="margin-left: auto;"><text class="el-icon-arrow-right"></text></view>
    </view>
    <view :class="$style['section']">
      <!-- <view class="section__header">商品</view> -->
      <view :class="$style['linesSummary']" @tap="productsDrawerVisible=true">
        <image
          v-for="(line, index) in (getField('lines') || [])" :key="line.id"
          v-if="index < 3" :src="optimizeImage(line.image, 100)"
          :class="$style['lineImage']" mode="aspectFill"
        ></image>
        <view style="margin-left: auto; margin-right: 0.5em; text-align: center;">
          <view>共 {{ (getField('lines') || []).length }} 件</view>
          <!-- <view :class="$style['textTip']">(可选配送方式)</view> -->
        </view>
        <view :class="$style['caret']"><text class="el-icon-arrow-right"></text></view>
      </view>
      <view :class="$style['couponCodesSummary']" @tap="couponCodesDrawerVisible=true">
        <view>优惠券</view>
        <view style="margin-left: auto; margin-right: 0.5em;" :class="$style['textTip']">
          <template v-if="getField('coupon_codes[0]')">已选择优惠券: {{ getField('coupon_codes[0].title') }}</template>
          <template v-else>选择优惠券</template>
        </view>
        <view :class="$style['caret']"><text class="el-icon-arrow-right"></text></view>
      </view>
    </view>
    <view :class="$style['section']">
      <view :class="$style['noteSummary']" @tap="noteDrawerVisible=true">
        <view style="width: 100px;">备注</view>
        <view style="margin-left: auto; margin-right: 0.5em;" :class="$style['textTip']">
          {{ getField('note') }}
        </view>
        <view :class="$style['caret']"><text class="el-icon-arrow-right"></text></view>
      </view>
    </view>
    <!-- <view class="section">支付方式, 因为没法选择, 这个不显示</view> -->
    <view :class="$style['section']">
      <view :class="$style['priceLine']">
        <text>商品金额</text>
        <price :price="getField('total_line_items_price')" :keepZero="true"></price>
      </view>
      <view :class="$style['priceLine']">
        <text>运费</text>
        <price :price="getField('shipping_cost')" :keepZero="true"></price>
      </view>
      <view :class="$style['priceLine']" v-for="discount in getField('discounts')" :key="discount.id">
        <text>{{ discount.description }}</text>
        <price :price="-discount.discount_price" :keepZero="true"></price>
      </view>
    </view>
    <view :class="$style['footer']">
      <view>
        <text>实付金额:</text>
        <price :price="finalPrice" :highlight="true" :keepZero="true"></price>
      </view>
      <button
        :class="[$style['buttonPayForOrder'], 'button', 'button--round', 'button--primary']"
        :disabled="placeOrderPending" @tap="handlePlaceOrder"
      >{{ placeOrderPending ? '正在提交...' : '去支付' }}</button>
    </view>
    <available-coupon-codes :visible.sync="couponCodesDrawerVisible"></available-coupon-codes>
    <checkout-products :visible.sync="productsDrawerVisible"></checkout-products>
    <checkout-note :visible.sync="noteDrawerVisible"></checkout-note>
  </view>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'
import AvailableCouponCodes from './AvailableCouponCodes'
import CheckoutProducts from './CheckoutProducts'
import CheckoutNote from './CheckoutNote'

export default {
  name: 'Checkout',
  components: {
    Price,
    CheckoutProducts,
    CheckoutNote,
    AvailableCouponCodes
  },
  data() {
    const { token } = getCurrentInstance().router.params
    return {
      token,
      placeOrderPending: false,
      productsDrawerVisible: false,
      noteDrawerVisible: false,
      couponCodesDrawerVisible: false
    }
  },
  computed: {
    ...mapState(['checkout', 'customer']),
    finalPrice() {
      const totalPrice = this.getField('total_price')
      return totalPrice
    }
  },
  created() {
    this.$store.commit('checkout/setData', { checkoutToken: this.token })
    Taro.setBackgroundColor({
      backgroundColorTop: '#f6f6f6',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  mounted() {
    /*
     * 需要在 onShow 里面 fetchCheckout,
     * 虽然无需考虑返回的时候更新 checkout 的情况, 因为 store 里每一次调用完一个更新方法, 比如 update_address
     * 但是需要考虑登录成功以后返回 checkout 页面的情况
     * 所以现在有一个问题就是地址选择以后返回 checkout 页面会 fetch 两次
     */
    // if (!this.customer.isAuthenticated) {
    //   Taro.navigateTo({ url: '/pages/login/index' })
    // } else {
    //   this.fetchCheckout()
    // }
  },
  onShow() {
    if (!this.customer.isAuthenticated) {
      Taro.navigateTo({ url: '/pages/login/index' })
    } else {
      this.fetchCheckout()
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    redirectToOrder(orderId) {
      const redirect = encodeURIComponent('/pages/orders/detail?id=' + orderId)
      Taro.reLaunch({ url: `/pages/account/index?redirect=${redirect}` })
    },
    async fetchCheckout() {
      Taro.showLoading({})
      try {
        await this.$store.dispatch('checkout/fetch')
      } catch(err) {
        if (_.get(err, 'response.status') === 400 && _.get(err,'response.data.code') === 'order_placed') {
          const orderId = _.get(err,'response.data.order.id')
          this.redirectToOrder(orderId)
        }
      }
      Taro.hideLoading({})
    },
    checkShippingAddress() {
      if (!this.getField('requires_shipping')) {
        return true
      }
      const complete = _.every([
        'province', 'city', 'district', 'address1', 'full_name', 'mobile'
      ], (field) => !!this.getField(`shipping_address.${field}`))
      if (complete) {
        return true
      } else {
        Taro.showToast({ title: '您填写的收货人信息错误, 请更正后再次提交', icon: 'none', duration: 3000 })
        return false
      }
    },
    async handlePlaceOrder() {
      if (!this.checkShippingAddress() || this.placeOrderPending) {
        return
      }
      this.placeOrderPending = true
      const openid = await this.$store.dispatch('customer/getOpenID')
      try {
        const orderData = await this.$store.dispatch('checkout/placeOrder')
        Taro.redirectTo({ url: `/pages/orders/pay?id=${orderData.id}` })
      } catch(err) {
        Taro.showModal({ title: '提交订单失败', content: '' + err, showCancel: false })
      }
      this.placeOrderPending = false
    },
    getField(path, defaultValue) {
      return _.get(this.checkout.data, path, defaultValue)
    },
    goToAddress() {
      Taro.navigateTo({ url: '/pages/addresses/index?intent=checkout' })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.page {
  overflow: hidden;
  padding-bottom: 80px;
  min-height: 100vh;
  background-color: $color-bg-gray;
}
/* section */
.section {
  border-radius: 6px;
  background-color: #fff;
  margin: 8px;
  padding: 12px;
}
// .sectionHeader {
//   margin-bottom: 12px;
//   // font-size: 0.95em;
//   font-weight: bold;
// }
.priceLine {
  display: flex;
  justify-content: space-between;
  align-items: center;
  & + .priceLine {
    margin-top: 10px;
  }
}
/* address */
.shippingAddressSummary {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .area, .contact {
    font-size: 0.9em;
    color: lignten($color-text, 30%);
  }
  .address {
    font-size: 1.1em;
    font-weight: bold;
    margin: 0.2em auto;
  }
}
/* lines */
.linesSummary {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .lineImage {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    overflow: hidden;
    margin-right: 10px;
  }
  padding-bottom: 12px;
  border-bottom: 1px solid $color-divider;
}
.couponCodesSummary {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 0;
  margin-bottom: -12px;
}
.noteSummary {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 0;
  margin-bottom: -12px;
  margin-top: -12px;
}
/* footer */
.footer {
  position: fixed;
  z-index: $z-index-footer;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 -1px 4px 0 rgba(0, 0, 0, 0.03);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.buttonPayForOrder {
  //
}
.textTip {
  font-size: 0.85em;
  color: $color-text-lighter;
}
.caret {
  color: $color-text-lighter;
}
</style>
