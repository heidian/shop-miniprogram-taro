<template>
  <view>
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
    ></component>
    <products ref="products"></products>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import ThemeBlocks from '@/mixins/ThemeBlocks'
import ListTable from '@/mixins/ListTable'
import Products from './Products'

export default {
  name: 'Home',
  mixins: [
    ThemeBlocks('blocks', { pageType: 'home'})
  ],
  components: {
    Products
  },
  computed: {
    //
  },
  onReachBottom() {
    this.$refs.products.fetchMore()
  },
  async mounted() {
    await this.fetchPageConfig()
  },
  methods: {
    //
  }
}
</script>

<style lang="scss"></style>
