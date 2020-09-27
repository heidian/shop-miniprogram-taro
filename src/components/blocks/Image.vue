<template>
  <view class="block--image" :style="css">
    <navigator
      hover-class="none"
      :url="getUrl(settingsData.url)" :open-type="getOpenType(settingsData.url)"
    >
      <image class="image" :src="optimizeImage(settingsData.image)" mode="widthFix"></image>
    </navigator>
  </view>
</template>

<script>
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
    getUrl(url) {
      const parse = parseUrl(url)
      return parse.url
    },
    getOpenType(url) {
      const parse = parseUrl(url)
      return parse.openType
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
