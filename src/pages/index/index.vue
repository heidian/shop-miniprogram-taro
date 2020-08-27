<template>
  <view class="index">
    <view>{{ customer.isAuthenticated }}</view>
    <view>{{ customer.customerToken }}</view>
    <view>{{ customer.data.id }}</view>
    <view>{{ customer.data.mobile }}</view>
    <NumberDisplay/>
    <NumberSubmit/>
  </view>
</template>

<script>
import { mapState } from 'vuex'

import NumberDisplay from '@/components/example/NumberDisplay.vue'
import NumberSubmit from '@/components/example/NumberSubmit.vue'

export default {
  name: 'Index',
  components: {
    NumberDisplay,
    NumberSubmit
  },
  computed: {
    ...mapState('customer', {
      customer: (state) => state
    })
  },
  mounted() {
    console.log(this.$store.state.config)
    console.log(this.$store.state.customer)
    this.$store.dispatch('customer/getCustomer')
  }
}
</script>

<style lang="scss">
.index {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
