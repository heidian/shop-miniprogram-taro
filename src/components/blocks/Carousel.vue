<template>
  <view class="block--carousel" :style="css">
    <view class="carousel" :style="{'paddingTop': paddingTop}">
      <!-- indicatorColor='#999' indicatorActiveColor='#333' -->
      <swiper
        v-if="carousel"
        class='carousel__swiper'
        :indicatorDots="false" :vertical="false"
        :circular="true" :autoplay="true" :interval="5000" :duration="300"
      >
        <swiper-item v-for="(item, index) in carousel" :key="index">
          <!-- <image class="carousel__image" :src="optimizeImage(item.image, 600)" mode="aspectFit"></image> -->
          <view
            :style="{'backgroundImage':backgroundImageUrl(item.image)}"
            class="carousel__image"
            @tap="goToUrl(item.url)"
          ></view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
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
        carousel: [],  // { image: { src, metafield }, url }
        imageRatio: 1  // 宽高比
      })
    }
  },
  data() {
    return {
      carousel: _.isEmpty(this.settingsData.carousel) ? null : [ ...this.settingsData.carousel ]
    }
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
    goToUrl,
  },
  watch: {
    'settingsData.carousel': {
      handler(newVal, oldVal) {
        this.carousel = null  // 无论如何都先清空 carousel 确保每次修改都会重新渲染 swiper
        if (!_.isEmpty(newVal)) {
          this.$nextTick(() => this.carousel = [ ...newVal ] )
        }
      },
      deep: true,
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
    // border-radius: 4px;
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
