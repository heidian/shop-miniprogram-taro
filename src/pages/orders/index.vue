<template>
  <view :class="$style['page']">
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
          <view :class="$style['totalPrice']">{{ order.total_price|currency }}</view>
          <view :class="$style['totalQty']">共{{ order.lines.length }}件</view>
        </view>
      </view>
      <view :class="$style['footer']"></view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'
import ListTable from '@/mixins/ListTable'
import { OrderStatus, OrderFinancialStatus, OrderFulfillmentStatus } from './constants'

export default {
  name: 'Orders',
  mixins: [
    ListTable('orders', { urlRoot: '/customers/order/' })
  ],
  data() {
    return {
      OrderStatus,
      OrderFinancialStatus,
      OrderFulfillmentStatus,
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  async onReachBottom() {
    Taro.showNavigationBarLoading()
    await this.fetchMore()
    Taro.hideNavigationBarLoading()
  },
  async mounted() {
    this.updateDefaultParams({
      'fields': ['id', 'order_status', 'financial_status', 'fulfillment_status',
                 'lines', 'total_price', 'created_at'].join(','),
      'fields[lines]': ['id', 'image', 'title'].join(','),
    }, { fetch: false })
    Taro.showNavigationBarLoading()
    await this.fetchList()
    Taro.hideNavigationBarLoading()
  },
  methods: {
    optimizeImage,
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
.page {}
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
</style>
