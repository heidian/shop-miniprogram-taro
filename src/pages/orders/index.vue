<template>
  <view class="page--orders">
    <view :class="$style['orderItem']" v-for="order in orders.data">
      <view>{{ order.id }}</view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import { API } from '@/utils/api'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'Orders',
  mixins: [
    ListTable('orders', { urlRoot: '/customers/order/' })
  ],
  data() {
    return {}
  },
  mounted() {
    this.fetchList()
  },
  methods: {
  }
}
</script>

<style lang="scss" module>
// @import './index.module.scss'
.orderItem {
  margin: 10px;
}
</style>
