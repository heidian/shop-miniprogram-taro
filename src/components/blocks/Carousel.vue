<template>
  <view class="block--carousel" :style="css">
    <view class="carousel" :style="{'paddingTop': paddingTop}">
      <swiper
        class='carousel__swiper'
        :indicatorDots="true" indicatorColor='#999' indicatorActiveColor='#333'
        :vertical="false" :circular="true" :autoplay="true"
      >
        <swiper-item v-for="(item, index) in settingsData.carousel" :key="index">
          <!-- <image class="carousel__image" :src="optimizeImage(item.image, 600)" mode="aspectFit"></image> -->
          <navigator
            :style="{'backgroundImage':backgroundImageUrl(item.image)}"
            class="carousel__image" hover-class="none"
            :url="getUrl(item.url)" :open-type="getOpenType(item.url)"
          ></navigator>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
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
        carousel: [],  // { image, url }
        imageRatio: 1  // 宽高比
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    paddingTop() {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      return `${percent}%`
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
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
.block--carousel {
  .carousel {
    display: block;
    width: 100%;
    padding-top: 100%;
    background-color: #fff;
    border-radius: 4px;
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
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
}
</style>
