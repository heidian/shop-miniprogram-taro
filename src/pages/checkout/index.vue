<template>
  <view class="page--checkout">
    <!-- <view class="section">drawerVisible: {{ couponCodesDrawerVisible }}</view> -->
    <view class="section shipping-address-summary" @tap="goToAddress">
      <view v-if="getField('shipping_address')">
        <view class="area">{{ getField('shipping_address.province') }} {{ getField('shipping_address.city') }} {{ getField('shipping_address.district') }}</view>
        <view class="address">{{ getField('shipping_address.address1') }}{{ getField('shipping_address.address2') }}</view>
        <view class="contact">{{ getField('shipping_address.full_name') }} {{ getField('shipping_address.mobile') }}</view>
      </view>
      <view class="caret-right" style="margin-left: auto;"></view>
    </view>
    <view class="section">
      <!-- <view class="section__header">商品</view> -->
      <view class="lines-summary" @tap="showLinesDrawer">
        <image
          v-for="(line, index) in (getField('lines') || [])" :key="line.id"
          v-if="index < 3" :src="optimizeImage(line.image, 100)"
          class="line-image" mode="aspectFill"
        ></image>
        <view style="margin-left: auto; margin-right: 0.5em; text-align: center;">
          <view>共 {{ (getField('lines') || []).length }} 件</view>
          <view class="text-tip">(可选配送方式)</view>
        </view>
        <view class="caret-right"></view>
      </view>
      <view class="coupon-codes-summary" @tap="showCouponCodesDrawer">
        <view>优惠券</view>
        <view style="margin-left: auto; margin-right: 0.5em;" class="text-tip">
          <template v-if="getField('coupon_codes[0]')">已选择优惠券: {{ getField('coupon_codes[0].title') }}</template>
          <template v-else>选择优惠券</template>
        </view>
        <view class="caret-right"></view>
      </view>
    </view>
    <!-- <view class="section">支付方式, 因为没法选择, 这个不显示</view> -->
    <view class="section">
      <view class="price-line">
        <text>商品金额</text>
        <price :price="getField('total_line_items_price')" :keepZero="true"></price>
      </view>
      <view class="price-line">
        <text>运费</text>
        <price :price="getField('shipping_cost')" :keepZero="true"></price>
      </view>
      <view class="price-line" v-for="discount in getField('discounts')" :key="discount.id">
        <text>{{ discount.description }}</text>
        <price :price="-discount.discount_price" :keepZero="true"></price>
      </view>
    </view>
    <view class="footer">
      <view>
        <text>实付金额:</text>
        <price :price="finalPrice" :highlight="true" :keepZero="true"></price>
      </view>
      <button
        class="button--payfororder button--round button--orange"
        :disabled="paymentPending" @tap="pay"
      >{{ paymentPending ? '正在支付...' : '立即支付' }}</button>
    </view>
    <available-coupon-codes :visible.sync="couponCodesDrawerVisible"></available-coupon-codes>
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
import './index.scss'

export default {
  name: 'Checkout',
  components: {
    Price,
    AvailableCouponCodes
  },
  data() {
    const { token } = getCurrentInstance().router.params
    return {
      token,
      paymentPending: false,
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
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6'
    })
  },
  mounted() {},
  onShow() {
    // 因为依赖于登录返回以后重新获取 checkout, 这些在 onShow 里面执行
    this.$store.commit('checkout/setData', { checkoutToken: this.token })
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
    async pay() {
      if (this.paymentPending) {
        return
      }
      this.paymentPending = true
      const openid = await this.$store.dispatch('customer/getOpenID')
      let res
      try {
        res = await API.post('/pingxx/charge_for_order/', {
          voucher_ids: [],
          order_token: this.token,
          openid: openid,
          channel: 'wx_lite'
        })
        this.paymentPending = false
      } catch(err) {
        Taro.showModal({ title: '发起支付失败', showCancel: false })
        this.paymentPending = false
        return
      }
      const credential = _.get(res.data, 'charge.charge_essentials.credential.wx_lite')
      const orderId = _.get(res.data, 'order.id')
      console.log(credential)
      Taro.requestPayment({
        ...credential,
        success: (res) => { console.log(res) },
        fail: (res) => { console.log(res) },
        complete: () => {
          // 支付成功或者失败都跳转订单页面
          this.redirectToOrder(orderId)
        }
      })
    },
    getField(path, defaultValue) {
      return _.get(this.checkout.data, path, defaultValue)
    },
    showLinesDrawer() {
      console.log('showLinesDrawer')
    },
    showCouponCodesDrawer() {
      this.couponCodesDrawerVisible = true
    },
    goToAddress() {
      Taro.navigateTo({ url: '/pages/addresses/index?intent=checkout' })
    }
  }
}
</script>

<style lang="scss"></style>
