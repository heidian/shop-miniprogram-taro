<template>
  <view class="block--rich-text" :style="css">
    <view class="taro_html" v-html="htmlValue"></view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { sanitizeHtml } from '@/utils/formatters'

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
      return sanitizeHtml(_.get(this.settingsData, 'content.html', ''))
    }
  },
  mounted() {},
  methods: {},
  filters: {},
}
</script>

<style lang="scss">
.block--rich-text {
  .taro_html {
    display: block;
    width: 100%;
    overflow: hidden;
  }
}
</style>
