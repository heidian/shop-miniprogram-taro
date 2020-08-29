<template>
  <view class="page--checkout">
    <view class="section"></view>
    <view class="section"></view>
    <view class="section"></view>
    <view class="section"></view>
  </view>
</template>

<script>
import _ from 'lodash'
import { getCurrentInstance } from '@tarojs/taro'
// import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { mapState } from 'vuex'

export default {
  name: 'Checkout',
  components: {},
  computed: {
    ...mapState('checkout', {
      checkout: (state) => state
    })
  },
  created() {
    const { token } = getCurrentInstance().router.params
    this.$store.commit('checkout/setData', { checkoutToken: token })
  },
  mounted() {
    this.$store.dispatch('checkout/fetch')
  },
  methods: {
    //
  }
}
</script>

<style lang="scss">
.page--checkout {
  background-color: #f8f8f8;
  overflow: hidden;
  > .section {
    border-radius: 6px;
    background-color: #fff;
    margin: 8px;
    min-height: 100px;
  }
}
</style>
