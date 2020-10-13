<template>
  <view :class="$style['page']">
    Rebate
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { mapState } from 'vuex'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'Rebate',
  mixins: [
    ListTable('rebates', { urlRoot: '/substores/partners/rebate/' })
  ],
  data() {
    return {
      //
    }
  },
  computed: {
    ...mapState(['customer'])
  },
  onReachBottom() {
    this.fetchRebates({ more: true })
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
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
  }
}
</script>

<style lang="scss" module>
@import "@/styles/mixins";
@import "@/styles/variables";
.page {
  //
}
</style>
