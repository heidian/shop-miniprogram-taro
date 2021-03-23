<template>
  <view class="block--image" :style="css">
    <image
      class="image" mode="widthFix"
      :src="optimizeImage(settingsData.image)"
      @tap="goToUrl(settingsData.url)"
    ></image>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { optimizeImage } from '@/utils/image'
import { goToUrl } from '@/utils/url'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        image: {},
        url: ''
      })
    }
  },
  data() {
    return {}
  },
  methods: {
    optimizeImage,
    goToUrl,
  }
}
</script>

<style lang="scss">
.block--image {
  .image {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
