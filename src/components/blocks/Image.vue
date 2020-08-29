<template>
  <view class="block--image" :style="css">
    <image class="image" :src="optimizeImage(settingsData.image)" mode="widthFix"></image>
  </view>
</template>

<script>
import { optimizeImage } from '@/utils/image'

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
    return {}
  },
  methods: {
    optimizeImage
  }
}
</script>

<style lang="scss">
.block--image {
  .image {
    display: block;
    width: 100%;
  }
}
</style>
