<template>
  <view :class="{
    [$style['page']]: true,
    [$style['disableScroll']]: !isReady
  }">
    <view v-if="!isReady" :class="$style['pending']">
      <view :class="$style['pending_text']">正在生成...</view>
    </view>
    <view v-else-if="type == 'product'" :class="$style['canvasImageWrapper']" :style="{backgroundImage: backgroundImageUrl(productCanvasImage)}">
      <!-- <image :src="productCanvasImage" mode="widthFix" :class="$style['canvasImage']" @longtap="onLongTapImage" show-menu-by-longpress></image> -->
    </view>
    <view v-else-if="type == 'shop'" :class="$style['canvasImageWrapper']">
      <image :src="shopCanvasImage" mode="widthFix" :class="$style['canvasImage']" @longtap="onLongTapImage" show-menu-by-longpress></image>
    </view>

    <canvas id="productCanvas" type="2d" :class="$style['productCanvas']"></canvas>
    <canvas id="shopCanvas" type="2d" :class="$style['shopCanvas']"></canvas>
  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import _ from 'lodash'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import ProductCanvas from '@/utils/share'

export default {
  name: 'Share',
  data() {
    const { product } = getCurrentInstance().router.params
    return {
      isReady: false,
      type: product ? 'product' : 'shop',
      productId: product,
      product: {},
      miniqrUrl: '',
      productCanvasImage: '',
      shopCanvasImage: ''
    }
  },
  computed: {
    ...mapState('customer', {
      customer: (state) => state.data || {},
    }),
    referralCode () {
      return _.get(this.customer, 'referral_code', '')
    },
    appid() {
      return this.$store.state.config.appid
    }
  },
  mounted () {
    this.fetchProduct()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    async fetchProduct() {
      // TODO 要处理 404
      const fields = _.join(['id', 'title', 'image'], ',')
      let product = {}
      try {
        const res = await API.get(`/shopfront/product/${this.productId}/`, {
          params: { fields }
        })
        product = res.data
      } catch (err) {
        console.log(err)
      }
      this.product = product
      await this.getProductQr()
    },
    async getProductQr () {
      if (!this.productId) {
        return
      }
      const scene = `r=pdt&id=${this.productId}&s=share`
      try {
        const res = await API.post('/weixin/wacode/', {
          appid: this.appid,
          page: 'pages/home',
          scene: scene
        })
        const miniqrUrl = _.get(res.data, 'src', '') ? optimizeImage(_.get(res.data, 'src', ''), 400) : ''
        if (!miniqrUrl) return;
        this.miniqrUrl = miniqrUrl
        this.productCanvas = new ProductCanvas({
          canvasId: '#productCanvas',
          customer: this.customer,
          product: this.product,
          miniqrUrl: this.miniqrUrl,
          isDark: false
        })
        this.productCanvas.initialize().then((dataURL) => {
          this.isReady = true
          this.productCanvasImage = dataURL
        }).catch(err => {

        })
      } catch (err) {

      }
    },
    onLongTapImage (e) {
      console.log('onLongTapProductCanvas', e)
      Taro.showModal({
        title: "长按中",
        content: "成功"
      })
    }
  },
}
</script>

<style lang="scss" module>
@import '@/styles/_mixins';
$color-orange: #ff5a00;
$color-text: #262626;
$color-text-light: #666666;
$color-divider: #f0f0f0;
$color-bg-gray: #f6f6f6;
page {
  background-color: $color-bg-gray;
}
.page {
  height: 100vh;
}
.disableScroll {
  overflow: hidden;
}
.pending {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(58, 62, 75);
}
.pending_text {
  font-size: 14px;
  color: $color-orange;
}
.canvasImageWrapper {
  background-color: orange;
  width: 75vw;
  padding-top: 163vw;
  margin: 0 auto;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
.productCanvas {
  display: none;
  width: 375px;
  height: 815px;
}
.canvasImage{
  display: block;
  width: 100%;
}
.shopCanvas {
  display: none;
  width: 375px;
  height: 785px;
}

</style>
