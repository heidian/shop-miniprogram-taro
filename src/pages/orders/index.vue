<template>
  <view :class="$style['page']" :style="$globalColors">
    <view :class="$style['tabs']">
      <view
        v-for="[value, title] in [
          ['all', '全部'], ['unpaid', '待付款'], ['paid', '待收货'], ['closed', '已完成'], ['cancelled', '已取消']
        ]" :key="title"
        :class="{ [$style['tab']]: true, [$style['active']]: filterName === value }"
        @tap="onChangeTab(value)"
      >{{ title }}</view>
    </view>
    <view
      v-for="order in orders.data" :key="order.id"
      :class="$style['orderItem']" @tap="goToDetail(order.id)"
    >
      <!-- <view class="btn">text</view> -->
      <view :class="$style['header']">
        <text :class="$style['time']">下单时间: {{ order.created_at | date }}</text>
        <view
          v-if="order.order_status !== 'open'"
          :class="$style['status']"
        >{{ OrderStatus[order.order_status] }}</view>
        <template v-else>
          <view
            :class="$style['status']"
          >{{ OrderFinancialStatus[order.financial_status] }}</view>
          <view
            v-if="order.financial_status !== 'pending'"
            :class="$style['status']"
          >{{ OrderFulfillmentStatus[order.fulfillment_status] }}</view>
        </template>
      </view>
      <view :class="$style['lines']">
        <image
          v-for="line in order.lines.slice(0,3)" :key="line.id"
          :class="$style['lineImage']"
          :src="optimizeImage(line.image, 100)"
        ></image>
        <text v-if="order.lines.length === 1" :class="$style['lineTitle']">{{ order.lines[0].title }}</text>
        <view :class="$style['lineSummary']">
          <view :class="$style['totalPrice']">{{ order.total_price|currency({keepZero: true}) }}</view>
          <view :class="$style['totalQty']">共{{ order.lines.length }}件</view>
        </view>
      </view>
      <view :class="$style['footer']">
        <template v-if="canContinuePay(order)">
          <button
            class="button button--primary button--mini button--round button--outline"
            @tap.stop="handleCancelOrder(order)"
          >取消订单</button>
          <button
            class="button button--primary button--mini button--round"
            @tap.stop="handlePay(order)"
          >继续支付</button>
        </template>
        <button
          v-else
          class="button button--primary button--mini button--round button--outline"
          @tap.stop="handleAddToCart(order)"
        >再来一单</button>
      </view>
    </view>
    <view v-if="!orders.count" :class="$style['emptyOrdersText']">您还没有相关订单</view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'
import ListTable from '@/mixins/ListTable'
import { OrderStatus, OrderFinancialStatus, OrderFulfillmentStatus } from './constants'

const FiltersOfTab = {
  'all': {},
  'unpaid': { order_status: 'open', financial_status__in: 'pending,partially_paid' },
  'paid': { order_status: 'open', financial_status__in: 'paid,refunded,partially_refunded' },
  'closed': { order_status: 'closed' },
  'cancelled': { order_status: 'cancelled' },
}

export default {
  name: 'Orders',
  mixins: [
    ListTable('orders', { urlRoot: '/customers/order/' })
  ],
  data() {
    const { filter } = getCurrentInstance().router.params
    const filterName = FiltersOfTab[filter] ? filter : 'all'
    return {
      filterName,
      OrderStatus,
      OrderFinancialStatus,
      OrderFulfillmentStatus,
    }
  },
  computed: {
    ...mapState(['customer'])
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  onReachBottom() {
    this.fetchOrders({ more: true })
  },
  async mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      this.updateDefaultParams({
        'fields': ['id', 'order_status', 'financial_status', 'fulfillment_status',
                   'lines', 'total_price', 'created_at'].join(','),
        'fields[lines]': ['id', 'image', 'title', 'variant', 'quantity'].join(','),
      }, { fetch: false })
      this.fetchOrders()
    }
  },
  methods: {
    optimizeImage,
    canContinuePay(order) {
      return order.order_status === 'open' && (
        order.financial_status === 'pending' || order.financial_status === 'partially_paid')
    },
    async fetchOrders({ more=false } = {}) {
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        const filters = FiltersOfTab[this.filterName] || {}
        this.updateFilter(filters, { fetch: false, partial: false })
        await this.fetchList()
      }
      Taro.hideNavigationBarLoading()
    },
    onChangeTab(value) {
      this.filterName = value
      this.fetchOrders()
    },
    goToDetail(orderId) {
      Taro.navigateTo({ url: '/pages/orders/detail?id=' + orderId })
    },
    async handleAddToCart(order) {
      Taro.showLoading({ title: '正在加入购物车' })
      await new Promise((resolve) => {
        const lines = [ ...order.lines ]
        const addToCart = () => {
          const line = lines.pop()
          if (!line) {
            return resolve()  // 加上 return 确保如果以后 if else 后面加其他代码, 也不会执行
          } else if (line.variant) {
            this.$store.dispatch('cart/add', {
              variantId: line.variant.id,
              quantity: line.quantity,
            }).then(() => {}).catch(() => {})
            setTimeout(addToCart, 1000)
          } else {
            setTimeout(addToCart, 0)
          }
        }
        addToCart()
      })
      Taro.hideLoading()
      Taro.switchTab({ url: '/pages/cart/index' })
    },
    handleCancelOrder(order) {
      const cancel = async () => {
        Taro.showLoading({ title: '正在取消订单' })
        try {
          const reason = '买家取消订单'
          const res = await API.post(`/customers/order/${order.id}/cancel/`, { reason })
          Taro.showToast({ title: '订单已取消', icon: 'none', duration: 1000 })
        } catch(err) {
          // console.log(err)
          Taro.showModal({ title: '订单取消失败', showCancel: false })
        }
        Taro.hideLoading()
        this.fetchOrders()
      }
      // Taro.showActionSheet({
      //   itemList: ['A', 'B', 'C'],
      //   success: function (res) { console.log(res.tapIndex) },
      //   fail: function (res) { console.log(res.errMsg) }
      // })
      Taro.showModal({
        success: (res) => {
          if (res.confirm) { cancel() }
        },
        // title: '取消订单',
        // content: '取消订单后，如需重新购买商品，需要重新下单',
        content: '确定取消订单？',
        cancelText: '关闭',
        confirmText: '确定取消',
        confirmColor: this.$globalColors['--color-primary'],
      })
    },
    handlePay(order) {
      Taro.navigateTo({ url: `/pages/orders/pay?id=${order.id}` })
    }
  }
}
</script>

<style lang="scss" module>
// @import './index.module.scss'
@import '@/styles/mixins';
@import '@/styles/variables';
.page {
  padding-top: 40px;
  overflow: hidden;
  min-height: 100vh;
  background-color: $color-bg-gray;
}
.tabs {
  position: fixed;
  z-index: $z-index-navbar;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  background-color: #fff;
  padding: 5px 10px 0;
  .tab {
    padding: 10px 10px 5px;
    &.active {
      border-bottom: 2px solid $color-text;
    }
  }
}
.orderItem {
  font-size: 13px;
  margin: 10px;
  border-radius: 6px;
  background-color: #fff;
  padding: 10px;
  // 一个样例, 不处理下面的 .btn
  :global(.btn) {
    color: red;
  }
}
.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .time {
    margin-right: auto;
  }
  .status {
    color: $color-text-light;
    & + .status::before {
      content: '/';
      display: inline-block;
      margin: 0 5px;
    }
  }
}
.footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  :global(.button) {
    margin-left: 10px;
  }
}
.lines {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 10px auto;
}
.lineImage {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  border-radius: 4px;
}
.lineTitle {
  flex: 1;
  font-size: 0.9em;
  @include ellipsis(3);
}
.lineSummary {
  margin-left: auto;
  width: 90px;
  text-align: right;
  padding-left: 20px;
  .totalPrice {
    font-weight: bold;
  }
  .totalQty {
    font-size: 0.85em;
    color: $color-text-light;
  }
}
.emptyOrdersText {
  padding: 40px 20px;
  text-align: center;
  color: $color-text-light;
}
</style>
