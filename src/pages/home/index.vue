<template>
  <view>
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :styleData="block.style" :settingsData="block.settings_data"
    ></component>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import ThemeBlocks from '@/mixins/ThemeBlocks'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'Home',
  mixins: [
    ThemeBlocks('blocks', { pageType: 'home'})
  ],
  components: {
    //
  },
  computed: {
    //
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
