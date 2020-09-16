<template>
  <view class="page--static">
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
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
    ThemeBlocks('blocks')
  ],
  components: {},
  computed: {
    //
  },
  data() {
    const { name } = getCurrentInstance().router.params
    return {
      pageName: name
    }
  },
  created() {
    // TODO, 这里的颜色需要配置, 而不是写死
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6'
    })
  },
  onReachBottom() {},
  async mounted() {
    const data = await this.fetchPageConfig('static', this.pageName)
    Taro.setNavigationBarTitle({
      title: data.page.title
    })
  },
  methods: {
    //
  }
}
</script>

<style lang="scss">
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page--static {
  //
}
</style>
