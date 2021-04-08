<template>
  <view class="block--video" :style="css">
    <view class="video-wrapper" :style="{'paddingTop': paddingTop}">
      <video
        class="video"
        :src="videoSrc"
        :controls="controls"
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
      ></video>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        video: {},
        videoRatio: 16/9  // 宽高比
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    autoplay() {
      return !!this.settingsData.autoplay
    },
    muted() {
      // 如果是 autoplay 就只能 muted
      return this.autoplay
    },
    controls() {
      return !this.autoplay
    },
    loop() {
      return this.autoplay
    },
    videoSrc() {
      return _.get(this.settingsData, 'video.src') || ''
    },
    paddingTop() {
      const percent = (100 / (+this.settingsData.videoRatio || (16/9))).toFixed(6)
      return `${percent}%`
    }
  },
  methods: {
    //
  }
}
</script>

<style lang="scss">
.block--video {
  .video-wrapper {
    position: relative;
  }
  .video {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
