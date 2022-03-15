<template>
  <view :class="$style['page']" v-if="!pending && orderData" :style="$globalColors">
    <view style="margin: 12px; font-weight: bold">订单编号: {{ orderData['order_number'] }}</view>
    <view :class="$style['section']" v-if="+voucherPaidAmount">
      <view>礼品卡支付</view>
      <view style="margin-left: auto; margin-right: 0.5em;" :class="$style['textTip']">
        <text>已支付</text>
        <price :price="+voucherPaidAmount" :highlight="true" :keepZero="true"></price>
      </view>
    </view>
    <view :class="$style['section']" v-else @tap="vouchersDrawerVisible=true">
      <view>礼品卡支付</view>
      <view style="margin-left: auto; margin-right: 0.5em;" :class="$style['textTip']">
        <template
          v-if="+paymentPayload['voucher']['amount']"
        >已选择: {{ paymentPayload['voucher']['amount']|currency({keepZero: true}) }}</template>
        <template v-else>选择礼品卡</template>
      </view>
      <view :class="$style['caret']"><text class="el-icon-arrow-right"></text></view>
    </view>
    <view :class="$style['section']">
      <view>微信小程序支付</view>
      <view style="margin-left: auto; margin-right: 0.5em;">
        <text>待支付</text>
        <price :price="paymentPayload['wx_lite']['amount']" :highlight="true" :keepZero="true"></price>
      </view>
    </view>
    <view :class="$style['footer']">
      <view>
        <text>未付款金额:</text>
        <price :price="orderData['payable_price']" :highlight="true" :keepZero="true"></price>
      </view>
      <button
        :class="['button', 'button--round', 'button--primary']"
        :disabled="paymentPending" @tap="pay"
      >{{ paymentPending ? '正在支付...' : '支付' }}</button>
    </view>
    <drawer
      position="bottom" header="礼品卡" :class="$style['drawer']"
      :visible.sync="vouchersDrawerVisible" @open="fetchVouchers"
    >
      <view v-if="vouchers.pending" :class="$style['loading']"><text class="el-icon-more"></text></view>
      <view v-else :class="$style['vouchersList']">
        <view
          v-for="(voucher, index) in vouchers.data" :key="`${voucher.id}-${index}`"
          :class="[$style['vouchersItem'], paymentPayload['voucher']['voucher_id'] === voucher.id && 'is-selected']"
          @tap="() => handleSelectVoucher(voucher)"
        >
          <view :class="$style['title']">{{ voucher.title }}</view>
          <view :class="$style['balance']">{{ voucher.balance|currency({keepZero: true}) }}</view>
          <icon type="success" size="20" :color="$globalColors['--color-primary']" :class="$style['check']"></icon>
        </view>
      </view>
    </drawer>
  </view>
  <view v-else :class="$style['loading']"><text class="el-icon-more"></text></view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import Price from '@/components/Price'
import Drawer from '@/components/Drawer'

export default {
  name: 'Pay',
  components: {
    Price,
    Drawer,
  },
  data() {
    const { id } = getCurrentInstance().router.params
    const paymentPayload = {
      'points': {
        'order_id': id,
        'channel': 'points',
        'amount': 0,
        'points': 0,
      },
      'voucher': {
        'order_id': id,
        'channel': 'voucher',
        'amount': 0,
        'voucher_id': null,
      },
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
      vouchersDrawerVisible: false,
      vouchers: {
        pending: false,
        data: [],
      }
    }
  },
  computed: {
    ...mapState(['customer']),
    voucherPaidAmount() {
      const transactions = _.get(this.orderData, 'transactions') || []
      const voucherTransactions = _.filter(transactions, { status: 'success', channel: 'voucher' })
      return _.sumBy(voucherTransactions, (transaction) => +transaction.amount)
    }
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      this.fetchOrder()
    }
  },
  methods: {
    resetVoucherAndPoints() {
      this.paymentPayload['points']['amount'] = 0
      this.paymentPayload['points']['points'] = 0
      this.paymentPayload['voucher']['amount'] = 0
      this.paymentPayload['voucher']['voucher_id'] = null
    },
    updateAmount() {
      let amount = +this.orderData['payable_price']
      /* voucher */
      const voucherPayload = this.paymentPayload['voucher']
      if (+voucherPayload['amount']) {
        if (amount < +voucherPayload['amount']) {
          voucherPayload['amount'] = amount
        }
        amount -= (+voucherPayload['amount'])
      }
      /* wx_lite */
      this.paymentPayload['wx_lite']['amount'] = amount
    },
    async fetchOrder() {
      this.pending = true
      try {
        const res = await API.get(`/customers/order/${this.orderId}/`)
        this.orderData = res.data
        if (this.orderData.financial_status !== 'pending' &&
            this.orderData.financial_status !== 'partially_paid') {
          this.redirectToOrder()
        } else {
          this.resetVoucherAndPoints()
          this.updateAmount()
        }
      } catch(err) {
        Taro.showModal({
          title: '出错了',
          content: '订单信息不存在',
          showCancel: false
        })
      }
      this.pending = false
    },
    async fetchVouchers() {
      this.vouchers.pending = true
      try {
        const res = await API.get(`/customers/voucher/`)
        this.vouchers.data = res.data.results
      } catch(err) {
        console.log(err)
      }
      this.vouchers.pending = false
    },
    handleSelectVoucher(voucher) {
      const voucherPayload = this.paymentPayload['voucher']
      if (voucherPayload['voucher_id'] !== voucher.id) {
        voucherPayload['voucher_id'] = voucher.id
        voucherPayload['amount'] = voucher.balance
      } else {
        voucherPayload['voucher_id'] = null
        voucherPayload['amount'] = 0
      }
      this.updateAmount()
      this.vouchersDrawerVisible = false
    },
    async payPoints() {
      const payload = { ...this.paymentPayload['points'] }
      if (!+payload['amount']) {
        return
      }
      /* TODO! */
    },
    async payVoucher() {
      const payload = { ...this.paymentPayload['voucher'] }
      if (!+payload['amount']) {
        return
      }
      try {
        const res = await API.post('/payments/pay_for_order/', payload)
      } catch(err) {
        Taro.showModal({ title: '礼品卡支付失败', showCancel: false })
        throw err
      }
    },
    async payWxLite() {
      const payload = { ...this.paymentPayload['wx_lite'] }
      if (!+payload['amount']) {
        return
      }
      const openid = await this.$store.dispatch('customer/getOpenID')
      payload['openid'] = openid
      let credential = null
      try {
        const res = await API.post('/payments/pay_for_order/', payload)
        credential = _.get(res.data, 'charge.charge_essentials.credential.wx_lite')
      } catch(err) {
        Taro.showModal({ title: '发起支付失败', showCancel: false })
        throw err
      }
      if (credential) {
        await Taro.requestPayment(credential)
      }
    },
    async pay() {
      if (this.paymentPending) {
        return
      }
      this.paymentPending = true
      try {
        await this.payPoints()
        await this.payVoucher()
        await this.payWxLite()
        this.redirectToOrder()
      } catch(err) {
        console.log(err)
        this.fetchOrder()
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
  overflow: hidden;
  min-height: 100vh;
  background-color: $color-bg-gray;
}
.section {
  border-radius: 6px;
  background-color: #fff;
  margin: 8px;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
.textTip {
  font-size: 0.85em;
  color: $color-text-lighter;
}
.caret {
  color: $color-text-lighter;
}
.vouchersList {
  min-height: 200px;
  overflow: hidden;
  background-color: $color-bg-gray;
}
.vouchersItem {
  background-color: #fff;
  margin: 8px;
  padding: 15px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .balance {
    margin-left: auto;
    margin-right: 0.5em;
  }
  .check {
    opacity: 0
  }
  &:global(.is-selected) {
    .check {
      opacity: 1
    }
  }
}
</style>
