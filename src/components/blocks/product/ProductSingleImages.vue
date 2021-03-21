<!-- TODO 需要根据 variant 的变化修改当前图片 -->
<template>
  <view :style="css">
    <!-- indicatorColor='#999' indicatorActiveColor='#333' -->
    <swiper
      :class="$style['productImages']"
      :indicatorDots="false" :vertical="false"
      :circular="true" :autoplay="true" :interval="5000" :duration="300"
    >
      <swiper-item :class="$style['productImagesSwiperItem']" v-for="(image, index) in product.images" :key="image.id">
        <image :class="$style['productImagesSwiperItemImage']" mode="aspectFit" :src="optimizeImage(image, 400)" @tap="() => previewImage(image, product.images)"></image>
      </swiper-item>
    </swiper>
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
      default: () => ({})
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
      //
    }
  },
  computed: {
    //
  },
  mounted() {
    //
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
  },
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
/* Images Swiper */
.productImages {
  width: 100vw;
  height: 100vw;
}
.productImagesSwiperItemImage {
  width: 100%;
  height: 100%;
}
</style>
