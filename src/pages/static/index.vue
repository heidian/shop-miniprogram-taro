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
import ThemeBlocks from '@/mixins/ThemeBlocks'

export default {
  name: 'Static',
  mixins: [
    ThemeBlocks  // 会在页面上产生 blocks, pageType 和 pageName 三个变量
  ],
  components: {},
  computed: {
    //
  },
  data() {
    return {}
  },
  created() {},
  onReachBottom() {},
  async mounted() {
    const pageType = 'static'
    const pageName = getCurrentInstance().router.params.name
    const data = await this.fetchPageConfig(pageType, pageName)
    Taro.setNavigationBarTitle({
      title: data.page.title
    })
  },
  methods: {
    //
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.page {
  //
}
</style>
