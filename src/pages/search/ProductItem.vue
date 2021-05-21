<template>
  <view :class="$style['productItem']" @tap="goToProduct(product.name)">
    <view :class="$style['imageWrapper']">
      <image
        :class="$style['image']" mode="aspectFill" :lazy-load="true"
        :src="optimizeImage(product.image, 200)"
      ></image>
      <view
        v-if="productTag.value"
        :class="$style['productTag']" :style="{'backgroundColor': productTag.color}"
      >{{ productTag.value }}</view>
      <view :class="$style['zoomIcon']" @tap.stop="handleZoom">
        <text class="el-icon-zoom-in"></text>
      </view>
    </view>
    <view :class="$style['textWrapper']">
      <view :class="$style['title']">{{ product.title }}</view>
      <view :class="$style['description']">{{ product.description }}</view>
      <price
        :class="$style['price']" :highlight="true" :keepZero="true"
        :price="product.price" :compareAtPrice="product.compare_at_price"
      ></price>
    </view>
    <view :class="$style['colorOptionsWrapper']">
      <image
        v-for="item in productColorOptions.slice(0, 6)" :key="item.name"
        :class="$style['colorOptionsItem']"
        mode="aspectFill" :lazy-load="true"
        :src="optimizeImage(item.image, 40)"
      ></image>
      <view v-if="productColorOptions.length > 6" :class="[$style['colorOptionsItem'], 'el-icon-plus']"></view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import dayjs from 'dayjs'
import Taro from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'

export default {
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  components: {
    Price,
  },
  data() {
    return {
      colorNameToImage: {},
      productColorOptions: [],
      productTag: {},
    }
  },
  computed: {
    ...mapState({
      shopName: (state) => state.config.shopname
    }),
  },
  created() {},
  mounted() {
    this.getProductColorOptions()
    this.getProductTag()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    goToProduct(productName) {
      /* 没有特别原因不要用 wx 的方法, 全部用 Taro 上的方法 */
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    },
    getProductColorOptions() {
      const colorOptionTitle = _.get(this.$store.state.theme, 'themeSettingsData.colorOptionTitle.value') || ''
      const option = _.find(this.product.options, { title: colorOptionTitle }) || []
      if (!option) {
        return []
      }
      const results = _.map(option.values, (colorName) => {
        let image = this.colorNameToImage[colorName]
        if (!image) {
          const colorOptionImages = _.get(this.$store.state.theme, 'themeSettingsData.colorOptionImages') || []
          const item = _.find(colorOptionImages, (item) => _.get(item, 'metafield.altText') === colorName)
          if (item) {
            image = { src: item.src }
          }
        }
        return { name: colorName, image }
      })
      this.productColorOptions = _.filter(results, (item) => !!item.image)
    },
    getProductTag() {
      if (this.shopName !== 'joyberry') {
        // 只为 joyberry 计算 tag
        return {}
      }
      const days = dayjs().diff(dayjs(this.product.published_at), 'day')
      if (+this.product.compare_at_price > +this.product.price) {
        this.productTag = {
          value: 'Sale',
          color: '#960704',
        }
      } else if (days <= 7) {
        this.productTag = {
          value: 'New',
          color: '#BCAD84',
        }
      } else {}
    },
    handleZoom() {
      Taro.showLoading({})
      API.get(`/shopfront/product/${this.product.id}/`, {
        params: { fields: 'id,images' }
      }).then((res) => {
        const images = res.data.images
        if (images.length) {
          const urls = _.map(images, (image) => this.optimizeImage(image))
          Taro.previewImage({ current: urls[0], urls })
        }
        Taro.hideLoading()
      }).catch((err) => {
        Taro.hideLoading()
      })
    }
  },
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.productItem {
  width: 100%;
  border-radius: 5px;
  // box-shadow: 0 3px 5px rgba(#000, 0.2);
  background-color: #fff;
  overflow: hidden;
}
.textWrapper {
  padding: 7px;
}
.title, .description {
  font-size: 12px;
  line-height: 15px;
  height: 30px;
  letter-spacing: 1px;
  word-break: break-all;
  @include ellipsis(2);
  margin-bottom: 5px;
}
.title {
  font-weight: 500;
  color: $color-text;
}
.description {
  color: $color-text-light;
}
.imageWrapper {
  width: 100%;
  padding-top: 100%;
  position: relative;
}
.image {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.productTag {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 12px;
  line-height: 16px;
  padding: 2px 6px;
  color: #fff;
}
.zoomIcon {
  position: absolute;
  top: 0;
  right: 0;
  display: block;
  font-size: 16px;
  padding: 5px 10px 15px 15px;
  opacity: 0.7;
}
.colorOptionsWrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 7px 7px;
}
.colorOptionsItem {
  width: 15px;
  height: 15px;
  color: $color-text-light;
  + .colorOptionsItem {
    margin-left: 5px;
  }
}
</style>
