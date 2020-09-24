<template>
  <view :class="$style['page']">
    <view
      v-for="couponCode in couponCodes.data" :key="couponCode.id"
      :class="$style['couponCodeItem']"
    >
      <image :class="$style['couponImage']"></image>
      <view :class="$style['textWrapper']">
        <view :class="$style['couponTitle']">{{ couponCode.title }}</view>
        <view :class="$style['verboseTitle']">{{ couponCode.verbose_title }}</view>
        <view :class="$style['startEnd']">
          {{ couponCode.ends_at ? `截止 ${formatDateTime(couponCode.ends_at)}` : '无截止时间' }}
        </view>
      </view>
      <view :class="$style['couponStatus']">
        <text :class="$style['statusOff']" v-if="couponCode.status === 'used'">已使用</text>
        <text :class="$style['statusOn']" v-else>有效</text>
      </view>
    </view>
    <view v-if="hasMore" :class="$style['loadMore']"><text class="el-icon-more"></text></view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'
import ListTable from '@/mixins/ListTable'
import { formatDateTime } from '@/utils/formatters'

export default {
  name: 'CouponCodes',
  components: {},
  mixins: [
    ListTable('couponCodes', { urlRoot: '/customers/coupon_code/' })
  ],
  data() {
    return {}
  },
  computed: {
    ...mapState(['customer']),
    hasMore() {
      return this.couponCodes.data.length < this.couponCodes.count
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#f6f6f6',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  onReachBottom() {
    if (this.hasMore) {
      this.fetchCouponCodes({ more: true })
    }
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      this.updateDefaultParams({
        available: 1
      }, { fetch: false })
      this.fetchCouponCodes()
    }
  },
  methods: {
    optimizeImage,
    formatDateTime,
    async fetchCouponCodes({ more=false } = {}) {
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        await this.fetchList()
      }
      Taro.hideNavigationBarLoading()
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {
  padding: 15px;
}
.couponCodeItem {
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  margin-bottom: 10px;
  padding: 10px 50px 10px 90px;
  position: relative;
}
.couponImage {
  position: absolute;
  left: 0;
  top: 0;
  width: 80px;
  height: 80px;
  background-color: #aaa;
}
.textWrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}
.couponTitle, .verboseTitle, .startEnd {
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
  text-overflow: ellipsis;
}
.verboseTitle, .startEnd {
  color: $color-text-lighter;
  font-size: 0.8em;
}
.couponStatus {
  position: absolute;
  right: 15px;
  top: 10px;
  font-size: 13px;
  .statusOff {
    color: $color-text-lighter;
  }
  .statusOn {
    // color: $color-orange;
  }
}
.loadMore {
  text-align: center;
  font-size: 20px;
  padding: 10px 15px;
  color: $color-text-lighter;
}
</style>
