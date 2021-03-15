<template>
  <view class="block--text" :style="css">
    <view class="text" :style="textStyle">
      {{ textValue }}
    </view>
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
        textAlign: 'left',
        text: {
          'value': '',
          'style': {},
        },
        // text.style 里面只包含了 color 属性
        // textAlign 是段落属性, 不包含在 text.style 里, 板块自己提供配置选项
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    textValue() {
      return _.get(this.settingsData, 'text.value', '')
    },
    textStyle() {
      const style = _.get(this.settingsData, 'text.style', {})
      // 如果不设置, 这里也保留默认
      const textAlign = _.get(this.settingsData, 'textAlign', '')
      if (textAlign) {
        style['textAlign'] = textAlign
      }
      return style
    }
  },
  mounted() {
  },
  methods: {},
  filters: {}
}
</script>

<style lang="scss">
.block--text {
  .text {
    display: block;
    width: 100%;
    overflow: hidden;
  }
}
</style>
