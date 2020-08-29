<template>
  <view class="block--carousel" :style="css">
    <view class="carousel" :style="{'paddingTop': paddingTop}">
      <swiper
        class='carousel__swiper'
        :indicatorDots="true" indicatorColor='#999' indicatorActiveColor='#333'
        :vertical="false" :circular="true" :autoplay="true"
      >
        <swiper-item v-for="(image, index) in settingsData.images" :key="index">
          <image class="carousel__image" :src="optimizeImage(image, 600)" mode="aspectFit"></image>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

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
  computed: {
    paddingTop() {
      const percent = (100 / (+this.settingsData.ratio || 1)).toFixed(6)
      return `${percent}%`
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl
  }
}
</script>

<style lang="scss">
.block--carousel {
  .carousel {
    display: block;
    width: 100%;
    padding-top: 100%;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  .carousel__swiper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .carousel__image {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
