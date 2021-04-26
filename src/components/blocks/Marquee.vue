<template>
  <view class="block--marquee" :style="css">
    <view class="text" :style="textStyle">
      <text :class="['text-animation', 'text-animation--' + animation]">{{ textValue }}</text>
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
        // animation: null,  // slideLeft|slideRight
        content: {'value': ''}
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    animation() {
      // 目前不支持配置
      return 'slideLeft'
    },
    textValue() {
      return _.get(this.settingsData, 'content.value', '')
    },
    textStyle() {
      const style = _.get(this.settingsData, 'content.style', {})
      return style
    }
  },
  mounted() {
  },
  methods: {

  },
  filters: {}
}
</script>

<style lang="scss">
.block--marquee {
  .text {
    display: block;
    width: 100%;
    overflow: hidden;
  }
  .text-animation {
    padding: 5px;
    line-height: 1;
    font-size: 0.9em;
    display: inline-block;  // 不能用 block, 只有 inline-block 才可以让 width 变成文本实际的宽度
    position: relative;
    white-space: nowrap;
    min-width: 100%;
  }
  .text-animation--slideLeft {
    animation: 15s linear 1s infinite both running slideLeft;
    // animation: 3s linear 1s infinite reverse both running slideLeft;
  }
  .text-animation--slideRight {
    animation: 15s linear 1s infinite both running slideRight;
    // animation: 3s linear 1s infinite reverse both running slideRight;
  }
}
@keyframes slideRight {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
