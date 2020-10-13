<template>
  <view :class="$style['page']">
    <view v-for="item in rebates.data" :key="item.id" :class="$style['item']">
      <view :class="$style['itemHeader']">
        <view :class="$style['value']">
          <price :price="item.amount" :highlight="true"></price>
        </view>
        <view :class="$style['kind']">{{ item|kindText }}</view>
        <view :class="$style['timestamp']">{{ item.timestamp|datetime }}</view>
      </view>
      <view :class="$style['note']">{{ item.note }}</view>
    </view>
    <view v-if="rebates.pending" :class="$style['loading']"><text class="el-icon-loading"></text></view>
    <view
      v-else-if="hasMore"
      :class="$style['loadMore']"
      @tap="() => fetchRebates({ more: true })"
    ><text class="el-icon-more"></text></view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { mapState } from 'vuex'
import Price from '@/components/Price'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'Rebates',
  mixins: [
    ListTable('rebates', { urlRoot: '/substores/partners/rebate/' })
  ],
  components: {
    Price
  },
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
      return this.rebates.data.length < this.rebates.count
    }
  },
  onReachBottom() {
    if (this.hasMore) {
      this.fetchRebates({ more: true })
    }
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      // this.updatePageSize(1, { fetch: false })
      this.fetchRebates()
    }
  },
  methods: {
    async fetchRebates({ more=false } = {}) {
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        await this.fetchList()
      }
      Taro.hideNavigationBarLoading()
    },
  },
  filters: {
    kindText(item) {
      return {
        'order_paid': '自购返利',
        'referee_order_paid': '推荐购买返利',
        'referral': '邀请会员返利',
      }[item.kind]
    }
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
  font-size: 18px;
  width: 80px;
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
