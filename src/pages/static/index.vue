<template>
  <view :class="$style['page']" :style="$globalColors">
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
      :class="'_block_' + block.id"
      :page="page"
    ></component>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import ThemeBlocks from '@/mixins/ThemeBlocks'

export default {
  name: 'Static',
  mixins: [
    ThemeBlocks  // 会在页面上产生 blocks, pageType 和 pageName 三个变量
  ],
  data() {
    return {
      page: {}
    }
  },
  async mounted() {
    const pageType = 'static'
    const pageName = getCurrentInstance().router.params.name
    const data = await this.fetchPageConfig(pageType, pageName)
    this.page = data.page
    Taro.setNavigationBarTitle({
      title: this.page.title
    })
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.page {}
</style>
