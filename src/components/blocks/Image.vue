<template>
  <view class="block--image" :style="css">
    <image
      class="image" mode="widthFix"
      :src="optimizeImage(settingsData.image)"
      @tap="onClickImage"
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
    onClickImage() {
      if (this.settingsData.url) {
        this.goToUrl(this.settingsData.url)
      } else {
        const src = this.optimizeImage(this.settingsData.image)
        Taro.previewImage({ current: src, urls: [src] })
      }
    }
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
