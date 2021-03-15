<template>
  <view class="block--rich-text" :style="css">
    <view class="html" v-html="htmlValue"></view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        content: {
          'html': '',
        }
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    htmlValue() {
      return _.get(this.settingsData, 'content.html', '')
    }
  },
  mounted() {},
  methods: {},
  filters: {},
}
</script>

<style lang="scss">
.block--rich-text {
  .html {
    display: block;
    width: 100%;
    overflow: hidden;
  }
}
</style>
