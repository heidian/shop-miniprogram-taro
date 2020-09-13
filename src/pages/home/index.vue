<template>
  <view class="page--home">
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
    ></component>
    <infinite-products ref="infiniteProducts"></infinite-products>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import ThemeBlocks from '@/mixins/ThemeBlocks'
import InfiniteProducts from '@/components/InfiniteProducts'

export default {
  name: 'Home',
  mixins: [
    ThemeBlocks('blocks', { pageType: 'home'})
  ],
  components: {
    InfiniteProducts
  },
  computed: {
    //
  },
  created() {
    // TODO, 这里的颜色需要配置, 而不是写死
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6'
    })
  },
  onReachBottom() {
    this.$refs.infiniteProducts.onReachBottom()
  },
  async mounted() {
    await this.fetchPageConfig()
  },
  methods: {
    //
  }
}
</script>

<style lang="scss">
@import '@/styles/_variables';
page {
  background-color: $color-bg-gray;
}
.page--home {
  //
}
</style>
