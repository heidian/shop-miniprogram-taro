<template>
  <view>
    <view
      v-if="isVisible"
      :class="$style['imageSwiperContainer']"
      @tap.stop="() => {}">
      <view :class="$style['imageSwiperWrapper']">
        <swiper
          :class="$style['imageSwiper']"
          circular
          autoplay
          :indicator-dots="true"
          indicator-color='#999'
          indicator-active-color='#333'
          :current="current">
          <swiper-item v-for="imageItem in product.images" :key="`product-${product.id}-image-${imageItem.id}`">
            <image
              :class="$style['swiperImage']" mode="aspectFill" :lazy-load="true"
              :src="optimizeImage(imageItem, 800)"
            ></image>
          </swiper-item>
        </swiper>
        <view :class="$style['swiperIcon']" @tap.stop="handleClose">
          <text class="el-icon-close"></text>
        </view>
      </view>

      <view :class="$style['swiperActions']">
        <button
          :class="[$style['swiperBtn'], 'button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
          @tap.stop="variantsDrawerVisible = true"
        >加入购物车</button>
      </view>
    </view>

    <select-variant
      v-if="variantsDrawerVisible"
      :visible.sync="variantsDrawerVisible"
      openType="add_to_cart"
      :product="product"
      :variant="currentVariant"
      @tap.stop="() => {}"
      @selectVariant="onSelectVariant"
    ></select-variant>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import SelectVariant from '@/components/SelectVariant/SelectVariant'

export default {
  props: {
    product: {
      type: Object,
      default: {}
    },
    variant: {
      type: Object,
      default: {}
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SelectVariant
  },
  data() {
    return {
      isVisible: false,
      currentVariant: {},
      variantsDrawerVisible: false,
      current: 0,
    }
  },
  mounted() {
    if (this.visible) {
      this.handleOpen()
    }
  },
  watch: {
    visible(newValue) {
      if (newValue && !this.isVisible) {
        this.handleOpen()
      } else if (!newValue && this.isVisible) {
        this.handleClose()
      }
    },
    variant(newVal) {
      this.currentVariant = { ...newVal }
    }
  },
  methods: {
    optimizeImage,
    onSelectVariant(variantId, quantity) {
      if (!variantId || variantId === this.currentVariant.id) return;
      this.currentVariant = _.find(this.product.variants || [], { id: variantId })
    },
    handleClose() {
      this.isVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleOpen() {
      this.isVisible = true
      this.$emit('update:visible', true)
      this.$emit('open')
    }
  },
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';

.imageSwiperContainer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: $z-index-drawer - 1;
  background-color: rgba(255, 255, 255, 0.9);
}
.imageSwiperWrapper {
  width: 100%;
  padding-top: 100%;
  position: relative;
}
.imageSwiper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.swiperImage {
  width: 100%;
  height: 100%;
}
.swiperIcon {
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 20px;
  color: #000000;
  z-index: 10;
  width: 30px;
  height: 30px;
  padding: 4px;
  border: 1px solid #000000;
  border-radius: 50%;
  text {
    line-height: 20px;
    display: block;
  }
}
.swiperActions {
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.swiperBtn {
  flex: 1;
}
</style>
