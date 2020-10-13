<template>
  <view :class="$style['page']">
    Referee
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { mapState } from 'vuex'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'Referees',
  mixins: [
    ListTable('referees', { urlRoot: '/substores/partners/referee/' })
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
    this.fetchReferees({ more: true })
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      this.fetchReferees()
    }
  },
  methods: {
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
</style>
