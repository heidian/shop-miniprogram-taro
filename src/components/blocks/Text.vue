<!-- TODO 因为这里有一个 setTimeout, 需要有一个机制, 把 setTimeout 停掉 -->

<template>
  <view class="block--text" :style="css">
    <view class="text" :style="textStyle">
      <!-- 走马灯叫做 marquee -->
      <text
        v-if="settingsData.animation"
        :class="'text-animation--' + settingsData.animation"
      >{{ textValue }}</text>
      <template v-else>{{ textValue }}</template>
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
        animation: null,  // slideLeft|slideRight
        text: {'value': ''}
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
      style['textAlign'] = _.get(this.settingsData, 'textAlign', 'center')
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
.block--text {
  .text {
    display: block;
    width: 100%;
    overflow: hidden;
  }
  .text-animation--slideLeft,
  .text-animation--slideRight {
    display: inline-block;  // 不能用 block, 只有 inline-block 才可以让 width 变成文本实际的宽度
    position: relative;
    white-space: nowrap;
  }
  .text-animation--slideLeft {
    animation: 10s linear 1s infinite both running slideLeft;
    // animation: 3s linear 1s infinite reverse both running slideLeft;
  }
  .text-animation--slideRight {
    animation: 10s linear 1s infinite both running slideRight;
    // animation: 3s linear 1s infinite reverse both running slideRight;
  }
}
@keyframes slideLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
@keyframes slideRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
