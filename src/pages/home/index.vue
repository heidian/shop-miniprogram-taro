<template>
  <view class="index">
    <view>{{ customer.isAuthenticated }}</view>
    <view>{{ customer.customerToken }}</view>
    <view>{{ customer.data.id }}</view>
    <view>{{ customer.data.mobile }}</view>
  </view>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Home',
  components: {},
  computed: {
    ...mapState('customer', {
      customer: (state) => state
    })
  },
  mounted() {
    // console.log(this.$store.state.customer)
    // this.$store.dispatch('customer/login', {
    //   mobile: '18621761807',
    //   code: '32yd5he8pt'
    // })
    this.$store.dispatch('customer/getCustomer')
  }
}
</script>

<style lang="scss"></style>
