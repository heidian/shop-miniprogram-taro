<!-- TODO 需要根据 variant 的变化修改当前图片 -->
<template>
  <view :style="css">
    <!-- indicatorColor='#999' indicatorActiveColor='#333' -->
    <view :class="$style['swiperWrapper']" :style="{'paddingTop': paddingTop}">
      <swiper
        :class="$style['swiper']"
        :indicatorDots="false" :vertical="false"
        :circular="true" :autoplay="true" :interval="5000" :duration="300"
        :current="currentImageIndex" @change="onChangeCurrentIndex"
      >
        <swiper-item
          v-for="(image, index) in product.images" :key="image.id"
          :class="$style['swiperItem']"
        >
          <view
            :class="$style['productImageItem']"
            :style="{
              'backgroundImage': backgroundImageUrl(image),
              'paddingTop': paddingTop
            }"
            :src="optimizeImage(image, 400)" @tap="() => previewImage(image, product.images)"
          ></view>
        </swiper-item>
      </swiper>
    </view>
    <view
      v-if="product.images && product.images.length > 1 && settingsData.indicator"
      :class="$style['carouselIndicator']" :style="indicatorStyle"
    >
      <view :class="$style['carouselIndicatorDot']" :style="indicatorDotStyle"></view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import tinycolor from 'tinycolor2'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  name: 'ProductSingleImages',
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        imageRatio: 1,  // 宽高比
      })
    },
    product: {
      type: Object,
      required: true,
    },
    variant: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      currentImageIndex: 0,
      currentIndicatorIndex: 0,
      // 其实是和 currentImageIndex 一样的, 但是用了 :current="currentImageIndex" 以后在 onChangeCurrentIndex 里面就不能设置 currentImageIndex, 不然会导致乱跳
    }
  },
  computed: {
    paddingTop() {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      return `${percent}%`
    },
    indicatorStyle() {
      if (this.product.images && this.product.images.length > 1) {
        const indicatorColor = this.settingsData.indicatorColor || '#f5f5f5'
        return {
          'backgroundColor': indicatorColor
        }
      } else {
        return { 'display': 'none' }
      }
    },
    indicatorDotStyle() {
      if (this.product.images && this.product.images.length > 1) {
        const indicatorColor = this.settingsData.indicatorColor || '#f5f5f5'
        const left = this.currentIndicatorIndex / this.product.images.length
        const width = 1 / this.product.images.length
        return {
          'left': `${(left * 100).toFixed(2)}%`,
          'width': `${(width * 100).toFixed(2)}%`,
          'backgroundColor': tinycolor(indicatorColor).darken(10).toString(),
        }
      } else {
        return { 'display': 'none' }
      }
    },
  },
  mounted() {
    this.setCurrentImageIndex()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    previewImage(image, images) {
      Taro.previewImage({
        current: _.get(image, 'src'),
        urls: _.map(images, 'src')
      })
    },
    setCurrentImageIndex() {
      if (this.variant && this.variant.productimage_id) {
        const index = _.findIndex(this.product.images, (image) => image.id == this.variant.productimage_id)
        if (index >= 0) {
          this.currentImageIndex = index
          this.currentIndicatorIndex = index
        }
      }
    },
    onChangeCurrentIndex(event) {
      this.currentIndicatorIndex = +(_.get(event, 'detail.current') || 0)
    }
  },
  watch: {
    variant(newVal) {
      this.setCurrentImageIndex()
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.swiperWrapper {
  display: block;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  position: relative;
}
.swiper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.swiperItem {
  //
}
.productImageItem {
  display: block;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.carouselIndicator {
  position: relative;
  margin: 10px auto;
  width: 50%;
  height: 10px;
  border-radius: 10px;
  padding-left: 5px;
  padding-right: 5px;
}
.carouselIndicatorDot {
  position: absolute;
  top: 0;
  left: 0;
  height: 10px;
  min-width: 10px;  // 防止图片太多变得太窄
  border-radius: 5px;
  transition: all .5s ease-in-out;
}
</style>
