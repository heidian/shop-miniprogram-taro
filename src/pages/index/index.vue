<template>
  <view class="page--index" :style="globalColors">
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
    ...mapState(['globalColors']),
    ...mapState('customer', {
      customer: (state) => state
    })
  },
  mounted() {
    // console.log(this.$store.state.config)
    // console.log(this.$store.state.customer)
    this.$store.dispatch('customer/getCustomer')
    this.switchGlobalColors(0)
  },
  methods: {
    switchGlobalColors(index) {
      const paylad = [
        { '--color-bg': '#ff0000', '--color-text': '#000000' },
        { '--color-bg': '#0000ff', '--color-text': '#ffffff' }
      ][index]
      this.$store.commit('setGlobalColors', paylad)
      // setTimeout(() => this.switchGlobalColors(1 - index), 2000)
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/_variables';
$color-text: var(--color-text);
$color-bg: var(--color-bg);
.page--index {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  // color: #2c3e50;
  color: $color-text;
  background-color: $color-bg;
  color: var(--color-text);
  background-color: var(--color-bg);
  margin-top: 60px;
}
</style>
