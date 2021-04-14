<template>
  <view class="block--carousel" :style="css">
    <view class="carousel" :style="{'paddingTop': paddingTop}">
      <!-- indicatorColor='#999' indicatorActiveColor='#333' :indicatorDots="false" :vertical="false" -->
      <swiper
        v-if="carousel" class='carousel__swiper'
        :circular="true" :autoplay="true" :interval="5000" :duration="300"
        @change="onChange"
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
    <view
      v-if="carousel && carousel.length > 1 && settingsData.indicator"
      class="carousel-indicator" :style="indicatorStyle"
    >
      <view class="carousel-indicator__dot" :style="indicatorDotStyle"></view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import tinycolor from 'tinycolor2'
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
        imageRatio: 1,  // 宽高比
        indicatorColor: '',  // 指示点颜色
      })
    }
  },
  data() {
    return {
      current: 0,
      carousel: _.isEmpty(this.settingsData.carousel) ? null : [ ...this.settingsData.carousel ]
    }
  },
  computed: {
    paddingTop() {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      return `${percent}%`
    },
    indicatorStyle() {
      if (this.carousel && this.carousel.length > 1) {
        const indicatorColor = this.settingsData.indicatorColor || '#eee'
        return {
          'background-color': indicatorColor
        }
      } else {
        return { 'display': 'none' }
      }
    },
    indicatorDotStyle() {
      if (this.carousel && this.carousel.length > 1) {
        const indicatorColor = this.settingsData.indicatorColor || '#eee'
        const left = this.current / this.carousel.length
        const width = 1 / this.carousel.length
        return {
          'left': `${(left * 100).toFixed(2)}%`,
          'width': `${(width * 100).toFixed(2)}%`,
          'background-color': tinycolor(indicatorColor).darken(10).toString(),
        }
      } else {
        return { 'display': 'none' }
      }
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    goToUrl,
    onChange(event) {
      this.current = +(_.get(event, 'detail.current') || 0)
    }
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
  overflow: hidden;
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
  .carousel-indicator {
    position: relative;
    margin: 10px auto;
    width: 50%;
    height: 10px;
    border-radius: 10px;
    padding-left: 5px;
    padding-right: 5px;
  }
  .carousel-indicator__dot {
    position: absolute;
    top: 0;
    left: 0;
    height: 10px;
    border-radius: 5px;
    transition: all .5s ease-in-out;
  }
}
</style>
