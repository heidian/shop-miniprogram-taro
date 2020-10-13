<template>
  <view :class="$style['page']">
    <view v-for="item in referees.data" :key="item.id" :class="$style['item']">
      <image :class="$style['avatar']" :src="optimizeImage(item.avatar, 50)"></image>
      <view :class="$style['fullNameAndMobile']">
        <view>{{ item.full_name }}</view>
        <view :class="$style['mobile']">{{ item.mobile }}</view>
      </view>
      <view :class="$style['levelTitle']">{{ item.level_title }}</view>
    </view>
    <view v-if="referees.pending" :class="$style['loading']"><text class="el-icon-loading"></text></view>
    <view
      v-else-if="hasMore"
      :class="$style['loadMore']"
      @tap="() => fetchReferees({ more: true })"
    ><text class="el-icon-more"></text></view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { mapState } from 'vuex'
import { optimizeImage } from '@/utils/image'
import Price from '@/components/Price'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'referees',
  mixins: [
    ListTable('referees', { urlRoot: '/substores/partners/referee/' })
  ],
  components: {
    Price
  },
  data() {
    return {
      //
    }
  },
  computed: {
    ...mapState(['customer']),
    hasMore() {
      return this.referees.data.length < this.referees.count
    }
  },
  onReachBottom() {
    if (this.hasMore) {
      this.fetchReferees({ more: true })
    }
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      // this.updatePageSize(1, { fetch: false })
      this.fetchReferees()
    }
  },
  methods: {
    optimizeImage,
    async fetchReferees({ more=false } = {}) {
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
.page {
  //
}
.item {
  padding: 15px;
  border-bottom: 1px solid $color-divider;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}
.value {
  font-size: 18px;
  width: 80px;
}
.fullNameAndMobile {
  flex: 1;
  margin-left: 15px;
  margin-right: 10px;
}
.mobile {
  font-size: 12px;
  color: $color-text-light;
}
.levelTitle {
  // margin-left: auto;
  // font-size: 12px;
}
.loadMore, .loading {
  text-align: center;
  font-size: 20px;
  padding: 10px 15px;
  color: $color-text-lighter;
}
</style>
