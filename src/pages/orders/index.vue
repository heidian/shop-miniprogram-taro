<template>
  <view :class="$style['page']">
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
      :class="$style['orderItem']"
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
          :src="optimizeImage(line.image, 80)"
        ></image>
        <text v-if="order.lines.length === 1" :class="$style['lineTitle']">{{ order.lines[0].title }}</text>
        <view :class="$style['lineSummary']">
          <view :class="$style['totalPrice']">{{ order.total_price|currency({keepZero: true}) }}</view>
          <view :class="$style['totalQty']">共{{ order.lines.length }}件</view>
        </view>
      </view>
      <view :class="$style['footer']"></view>
    </view>
    <view v-if="!orders.count" :class="$style['emptyOrdersText']">您还没有相关订单</view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
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
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  onReachBottom() {
    this.fetchOrders({ more: true })
  },
  async mounted() {
    this.updateDefaultParams({
      'fields': ['id', 'order_status', 'financial_status', 'fulfillment_status',
                 'lines', 'total_price', 'created_at'].join(','),
      'fields[lines]': ['id', 'image', 'title'].join(','),
    }, { fetch: false })
    this.fetchOrders()
  },
  methods: {
    optimizeImage,
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
    }
  }
}
</script>

<style lang="scss" module>
// @import './index.module.scss'
@import '@/styles/_mixins';
$color-orange: #ff5a00;
$color-text: #262626;
$color-text-light: #666666;
$color-divider: #f0f0f0;
$color-bg-gray: #f6f6f6;
page {
  background-color: $color-bg-gray;
}
.page {
  padding-top: 40px;
}
.tabs {
  position: fixed;
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
  padding: 15px 10px;
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
  //
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
