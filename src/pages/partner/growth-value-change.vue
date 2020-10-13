<template>
  <view :class="$style['page']">
    Growth Value Change
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { mapState } from 'vuex'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'GrowthValueChange',
  mixins: [
    ListTable('growthValueChanges', { urlRoot: '/substores/partners/growth_value_change/' })
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
    this.fetchGrowthValueChanges({ more: true })
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
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
.page {
  //
}
</style>
