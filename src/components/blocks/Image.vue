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
import parseUrl from '@/utils/parseUrl'

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
    goToUrl(url) {
      const parse = parseUrl(url)
      if (parse.openType === 'switchTab') {
        Taro.switchTab({ url: parse.url })
      } else if (parse.openType === 'navigate') {
        Taro.navigateTo({ url: parse.url })
      } else if (parse.openType === 'scrollToBlock') {
        Taro.pageScrollTo({ selector: `#block--${parse.url}` })
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
