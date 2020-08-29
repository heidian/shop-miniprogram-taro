<!-- TODO 因为这里有一个 setTimeout, 需要有一个机制, 把 setTimeout 停掉 -->

<template>
  <view class="block--text" :style="css">
    <view class="text" :style="textStyle">
      <!-- 走马灯叫做 marquee -->
      <text
        v-if="animation === 'slideLeft'"
        :id="textId" class="text--animation" :style="animationStyle"
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
      default: () => ({})
    }
  },
  data() {
    return {
      textId: `T${parseInt((1 + Math.random()) * 100000)}`,
      animationStyle: {
        transition: 'none',
        left: '5px'
      }
    }
  },
  computed: {
    animation() {
      const animation = _.get(this.settingsData, 'animation')
      return animation === 'slideLeft' ? 'slideLeft' : ''
    },
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
    if (this.animation === 'slideLeft') {
      setTimeout(() => this.startAnimation(), 3000)
    }
  },
  methods: {
    async startAnimation() {
      const query = wx.createSelectorQuery().select(`#${this.textId}`)
      query.boundingClientRect((rect) => {
        const windowWidth = wx.getSystemInfoSync().windowWidth
        const textWidth = rect.width
        this.slideLeft(0, textWidth, windowWidth)
      }).exec()
    },
    slideLeft(distance, textWidth, windowWidth) {
      const step = 150
      if (distance < -(textWidth + step)) {
        distance = windowWidth
        this.animationStyle = {
          transition: 'none',
          left: `${distance}px`
        }
        setTimeout(() => this.slideLeft(distance - step, textWidth, windowWidth), 200)
      } else {
        this.animationStyle = {
          transition: 'left 3s linear',
          left: `${distance}px`
        }
        setTimeout(() => this.slideLeft(distance - step, textWidth, windowWidth), 3000)
      }
    }
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
  .text--animation {
    position: relative;
    white-space: nowrap;
  }
}
</style>
