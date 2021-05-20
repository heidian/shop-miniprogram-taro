<template>
  <view :class="$style['page']" v-if="!pending && orderData" :style="$globalColors">
    <view :class="$style['footer']">
      <view>
        <text>未付款金额:</text>
        <price
          :class="$style['totalPrice']"
          :price="orderData.payable_price" :highlight="true" :keepZero="true"
        ></price>
      </view>
      <button
        :class="['button', 'button--round', 'button--primary']"
        :disabled="paymentPending" @tap="pay"
      >{{ paymentPending ? '正在支付...' : '支付' }}</button>
    </view>
  </view>
  <view v-else :class="$style['loading']"><text class="el-icon-more"></text></view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import Price from '@/components/Price'

export default {
  name: 'Pay',
  components: {
    Price,
  },
  data() {
    const { id } = getCurrentInstance().router.params
    const paymentPayload = {
      'wx_lite': {
        'order_id': id,
        'channel': 'wx_lite',
        'amount': 0,
        'openid': '',
      }
    }
    return {
      pending: false,
      paymentPending: false,
      orderId: id,
      orderData: null,
      paymentPayload,
    }
  },
  computed: {
    ...mapState(['customer']),
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      this.fetchOrder()
    }
  },
  methods: {
    updateAmount() {
      // TODO 还要减去礼品卡的金额
      this.paymentPayload['wx_lite']['amount'] = this.orderData.payable_price
    },
    async fetchOrder() {
      this.pending = true
      try {
        const res = await API.get(`/customers/order/${this.orderId}/`)
        this.orderData = res.data
        this.updateAmount()
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
      const payload = {
        ...this.paymentPayload['wx_lite'],
        openid
      }
      let credential = null
      try {
        const res = await API.post('/payments/pay_for_order/', payload)
        credential = _.get(res.data, 'charge.charge_essentials.credential.wx_lite')
      } catch(err) {
        Taro.showModal({ title: '发起支付失败', showCancel: false })
      }
      if (credential) {
        try {
          await Taro.requestPayment({ ...credential })
          this.redirectToOrder()
        } catch(err) {
          console.log(err)
          this.fetchOrder()
        }
      }
      this.paymentPending = false
    },
    redirectToOrder() {
      const redirect = encodeURIComponent('/pages/orders/detail?id=' + this.orderId)
      Taro.reLaunch({ url: `/pages/account/index?redirect=${redirect}` })
    },
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.page {
  padding-bottom: 64px;
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
