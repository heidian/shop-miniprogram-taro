<template>
  <view class="page--index" :style="$globalColors">
    <button class="button button--primary button--small button--round">主色按钮</button>
    <button class="button button--primary button--small button--round button-hover">主色按钮 hover</button>
    <button class="button button--primary button--small button--round" disabled>主色按钮 disabled</button>
    <button @tap="switchGlobalColors">切换颜色</button>
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
  data() {
    return {
      themeGroup: 0
    }
  },
  computed: {
    ...mapState(['customer'])
  },
  mounted() {
    // console.log(this.$store.state.config)
    // console.log(this.$store.state.customer)
    // this.$store.dispatch('customer/getCustomer')
  },
  methods: {
    switchGlobalColors() {
      this.themeGroup = 1 - this.themeGroup
      const paylad = [
        { 'colorPrimary': '#ff0000', 'colorText': '#eeeeee', 'colorBg': '#000000' },
        { 'colorPrimary': '#ff00ff', 'colorText': '#000000', 'colorBg': '#eeeeee' },
      ][this.themeGroup]
      // console.log(this.themeGroup, paylad)
      this.$store.commit('theme/resetThemeSettings', { settingsData: paylad })
      // setTimeout(() => this.switchGlobalColors(1 - index), 2000)
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables';
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
