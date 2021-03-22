<template>
  <view :class="$style['page']" :style="$globalColors">
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
      :id="'block--' + block.id"
    ></component>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import ThemeBlocks from '@/mixins/ThemeBlocks'
import { syncTabBarStyleWithTheme } from '@/utils'

export default {
  name: 'Home',
  mixins: [
    ThemeBlocks  // 会在页面上产生 blocks, pageType 和 pageName 三个变量
  ],
  components: {},
  data() {
    return {}
  },
  computed: {},
  onShow() {
    if (this.$store.state.config.shopname === 'tezignlove') {
      Taro.hideTabBar()
    }
    syncTabBarStyleWithTheme()
  },
  // 不能覆盖 onLoad
  // onLoad() {},
  onReachBottom() {},
  async mounted() {
    const data = await this.fetchPageConfig('home')
    Taro.setNavigationBarTitle({
      title: data.shop.title
    })
  },
  methods: {}
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.page {
  //
}
</style>
