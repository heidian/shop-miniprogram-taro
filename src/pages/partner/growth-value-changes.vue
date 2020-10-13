<template>
  <view :class="$style['page']">
    <view v-for="item in growthValueChanges.data" :key="item.id" :class="$style['item']">
      <view :class="$style['itemHeader']">
        <view :class="$style['value']">成长值 +{{ item.growth_value_adjustment }}</view>
        <view :class="$style['kind']">{{ item.kind === 'order_paid' ? '购买商品' : item.note }}</view>
        <view :class="$style['timestamp']">{{ item.timestamp|datetime }}</view>
      </view>
      <view :class="$style['note']" v-if="item.kind === 'order_paid'">{{ item.note }}</view>
    </view>
    <view v-if="growthValueChanges.pending" :class="$style['loading']"><text class="el-icon-loading"></text></view>
    <view
      v-else-if="hasMore"
      :class="$style['loadMore']"
      @tap="() => fetchGrowthValueChanges({ more: true })"
    ><text class="el-icon-more"></text></view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { mapState } from 'vuex'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'GrowthValueChanges',
  mixins: [
    ListTable('growthValueChanges', { urlRoot: '/substores/partners/growth_value_change/' })
  ],
  data() {
    return {
      //
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  computed: {
    ...mapState(['customer']),
    hasMore() {
      return this.growthValueChanges.data.length < this.growthValueChanges.count
    }
  },
  onReachBottom() {
    if (this.hasMore) {
      this.fetchGrowthValueChanges({ more: true })
    }
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      // this.updatePageSize(1, { fetch: false })
      this.fetchGrowthValueChanges()
    }
  },
  methods: {
    async fetchGrowthValueChanges({ more=false } = {}) {
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        await this.fetchList()
      }
      Taro.hideNavigationBarLoading()
    },
  }
}
</script>

<style lang="scss" module>
@import "@/styles/mixins";
@import "@/styles/variables";
page {
  background-color: $color-bg-gray;
}
.page {
  //
}
.item {
  background-color: #fff;
  padding: 15px;
  border-bottom: 1px solid $color-divider;
}
.itemHeader {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.value {
  border-radius: 2px;
  background-color: #e5c9a4;
  color: #5c411a;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  width: 90px;
}
.kind {
  flex: 1;
  margin-left: 10px;
  margin-right: 10px;
}
.timestamp {
  // margin-left: auto;
  font-size: 12px;
  color: $color-text-lighter;
}
.note {
  width: 100%;
  flex: 1;
  font-size: 13px;
  color: $color-text-lighter;
  margin-top: 5px;
}
.loadMore, .loading {
  text-align: center;
  font-size: 20px;
  padding: 10px 15px;
  color: $color-text-lighter;
}
</style>
