<!-- TODO 需要根据 variant 的变化修改当前图片 -->
<template>
  <view :style="css">
    <!-- indicatorColor='#999' indicatorActiveColor='#333' -->
    <view :class="$style['swiperWrapper']" :style="{'paddingTop': paddingTop}">
      <swiper
        :class="$style['swiper']"
        :indicatorDots="false" :vertical="false"
        :circular="true" :autoplay="true" :interval="5000" :duration="300"
        :current="currentImageIndex"
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
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
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
      currentImageIndex: 0
    }
  },
  computed: {
    paddingTop() {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      return `${percent}%`
    }
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
        }
      }
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
</style>
