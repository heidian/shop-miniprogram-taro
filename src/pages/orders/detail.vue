<template>
  <view :class="$style['page']" v-if="!pending && orderData">
    <view :class="$style['section']">
      <view :class="$style['nameAndMobile']">{{ nameAndMobile }}</view>
      <view :class="$style['address']">{{ fullAddress }}</view>
    </view>
    <view :class="$style['section']">
      <!-- <view class="section__header">商品</view> -->
      <view :class="$style['orderLine']" v-for="(line, index) in orderData.lines" :key="line.id">
        <image
          :class="$style['lineImage']" mode="aspectFill"
          :src="optimizeImage(line.image, 100)"
        ></image>
        <view :class="$style['lineText']">
          <view :class="$style['productTitle']">{{ line.product_title }}</view>
          <view :class="$style['variantTitle']">{{ line.variant_title }}</view>
          <view :class="$style['priceAndQuantity']">
            <price :price="line.price"></price>
            <text :class="$style['lineQuantity']">x{{ line.quantity }}</text>
          </view>
        </view>
      </view>
      <view :class="$style['dividerHorizontal']"></view>
      <view :class="$style['priceLine']">
        <text>商品金额</text>
        <price :price="orderData.total_line_items_price" :keepZero="true"></price>
      </view>
      <view :class="$style['priceLine']">
        <text>运费</text>
        <price :price="orderData.shipping_cost" :keepZero="true"></price>
      </view>
      <view :class="$style['priceLine']" v-for="discount in orderData.discounts" :key="discount.id">
        <text>{{ discount.description }}</text>
        <price :price="-discount.discount_price" :keepZero="true"></price>
      </view>
      <view :class="$style['dividerHorizontal']"></view>
      <button :class="$style['customerService']" open-type="contact"><text class="el-icon-headset"></text> 联系客服</button>
    </view>
    <view :class="$style['section']">
      <view>总计: <price :price="orderData.total_price" :keepZero="true" :highlight="true"></price></view>
      <view :class="$style['dividerHorizontal']"></view>
      <view :class="$style['statusLine']">支付方式: {{ PaymentChannels[orderData.selected_channel] }}</view>
      <view :class="$style['statusLine']">订单编号: {{ orderData.order_number }}</view>
      <view :class="$style['statusLine']">下单时间: {{ orderData.created_at|datetime }}</view>
      <view :class="$style['statusLine']">订单状态: {{ OrderStatus[orderData.order_status] }}</view>
      <view :class="$style['statusLine']">交易状态: {{ OrderFinancialStatus[orderData.financial_status] }}</view>
      <view :class="$style['statusLine']">发货状态: {{ OrderFulfillmentStatus[orderData.fulfillment_status] }}</view>
      <!-- <view>成交时间: {{ orderData.closed_at|datetime }}</view> -->
    </view>
    <view :class="$style['footer']" v-if="continuePay">
      <view>
        <text>未付款金额:</text>
        <price :price="orderData.unpaid_price" :highlight="true" :keepZero="true"></price>
      </view>
      <button
        :class="[$style['buttonPayForOrder'], 'button--round', 'button--orange']"
        :disabled="paymentPending" @tap="pay"
      >{{ paymentPending ? '正在支付...' : '继续付款' }}</button>
    </view>
    <infinite-products ref="infiniteProducts"></infinite-products>
  </view>
  <view v-else :class="$style['loading']"><text class="el-icon-more"></text></view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'
import InfiniteProducts from '@/components/InfiniteProducts'
import { OrderStatus, OrderFinancialStatus, OrderFulfillmentStatus, PaymentChannels } from './constants'

export default {
  name: 'Order',
  components: {
    Price,
    InfiniteProducts,
  },
  mixins: [],
  data() {
    const { id } = getCurrentInstance().router.params
    return {
      pending: false,
      paymentPending: false,
      orderId: id,
      orderData: null,
      OrderStatus,
      OrderFinancialStatus,
      OrderFulfillmentStatus,
      PaymentChannels,
    }
  },
  computed: {
    ...mapState(['customer']),
    nameAndMobile() {
      const { full_name, mobile } = this.orderData.shipping_address || this.orderData
      return [full_name, mobile].join(' ')
    },
    fullAddress() {
      if (this.orderData.shipping_address) {
        const { province, city, district, address1, address2 } = this.orderData.shipping_address
        return [province, city, district, address1, address2].join(' ')
      } else {
        return ''
      }
    },
    continuePay() {
      return this.orderData.order_status === 'open' && (this.orderData.financial_status === 'pending' || this.orderData.financial_status === 'partially_paid')
    }
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      this.fetchOrder()
    }
  },
  onReachBottom() {
    if (this.$refs.infiniteProducts) {
      // 加载完订单之前没有 infiniteProducts
      this.$refs.infiniteProducts.onReachBottom()
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    async fetchOrder() {
      this.pending = true
      try {
        const res = await API.get(`/customers/order/${this.orderId}/`)
        this.orderData = res.data
      } catch(err) {
        Taro.showModal({
          title: '出错了',
          content: '订单信息不存在',
          showCancel: false
        })
      }
      this.pending = false
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
          order_token: this.orderData.token,
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
      // console.log(credential)
      Taro.requestPayment({
        ...credential,
        success: (res) => { console.log(res) },
        fail: (res) => { console.log(res) },
        complete: () => {
          // 支付成功或者失败都跳转订单页面
          this.fetchOrder()
        }
      })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {
  padding-bottom: 64px;
  > .section {
    border-radius: 6px;
    background-color: #fff;
    margin: 8px;
    padding: 15px;
  }
}
.nameAndMobile {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 5px;
}
/* lines */
.orderLine {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
}
.lineImage {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
}
.lineText {
  flex: 1;
  height: 75px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  .productTitle {
    font-size: 0.9em;
  }
  .variantTitle {
    font-size: 0.85em;
    color: $color-text-light;
  }
  // .lineQuantity {
  //   font-size: 0.85em;
  //   color: $color-text-light;
  //   margin-left: 5px;
  // }
  .priceAndQuantity {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
.dividerHorizontal {
  margin: 15px auto;
  height: 1px;
  background-color: $color-divider;
}
.priceLine {
  margin: 5px auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.customerService {
  display: block;
  width: 100%;
  padding-top: 5px;
  padding-bottom: 5px;
  font-size: 16px;
  margin-bottom: -7px;
  background-color: transparent;
}
.statusLine {
  font-size: 0.9em;
  & + .statusLine {
    margin-top: 10px;
  }
}
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
.loading {
  text-align: center;
  padding: 20px;
  font-size: 2em;
  color: $color-text-lighter;
}
</style>
