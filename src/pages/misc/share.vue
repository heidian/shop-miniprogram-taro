<template>
  <view :class="{
    [$style['page']]: true,
    [$style['disableScroll']]: !isReady
  }">
    <view v-if="type && canvasImage" :class="$style['canvasImageWrapper']">
      <image
        :src="canvasImage"
        mode="widthFix"
        @load="onLoadCanvasImage"
        :class="[$style['canvasImage'], canvasImageReady && $style['imageVisible']]"
        :show-menu-by-longpress="true"></image>
    </view>
    <view v-if="isReady" :class="$style['actionSave']">
      <text :class="$style['saveHint']">保存图片，将好货分享给朋友们吧</text>
      <button :class="$style['btnSave']" @tap="onSaveImageToAblum">
        <image
          src="https://up.img.heidiancdn.com/o_1ehtmvja215282udkv0448118b0icon2x.png"
          mode="scaleToFill"
          :class="$style['btnIcon']"></image>
        <text :class="$style['btnText']">保存图片</text>
      </button>
    </view>

    <view v-if="!isReady && !canvasImageReady" :class="$style['pending']">
      <image
        mode="aspectFit"
        :class="$style['pendingIcon']"
        :src="'https://up.img.heidiancdn.com/o_1ehtu4aarjjg1t5dfa5nrjsg30shop2x.png'|imageUrl(100)"></image>
      <view :class="$style['pendingText']">正在加载素材，请稍等</view>
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
      productCanvas: null,
      shopCanvas: null,
      canvasImage: '',
      canvasImageReady: false
    }
  },
  computed: {
    ...mapState('customer'),
    referralCode () {
      return _.get(this.customer.data, 'referral_code', '')
    },
    appid () {
      return this.$store.state.config.appid
    },
    shareTitle () {
      return _.get(this.customer.data, 'full_name', '你的好友') + '给你分享以下好物'
    },
    shareScene () {
      return this.productId && this.referralCode ? `r=pdt&id=${this.productId}&s=share&c=${this.referralCode}` : ''
    },
    shareImage () {
      return optimizeImage(_.get(this.product, 'image'), 400)
    }
  },
  created() {
    if (this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  },
  mounted () {
    this.fetchProduct()
  },
  watch: {
    shareScene: {
      immediate: true,
      handler (newScene) {
        !!newScene && this.getProductQr()
      }
    }
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
    },
    async getProductQr () {
      if (!this.productId) {
        return
      }
      const scene = this.shareScene
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
          customer: this.customer.data,
          product: this.product,
          miniqrUrl: this.miniqrUrl,
          isDark: false
        })
        this.productCanvas.initialize().then((tempFilePath) => {
          this.canvasImage = tempFilePath
          _.delay(() => {
            this.isReady = true
          }, 500)
        }).catch(err => {

        })
      } catch (err) {

      }
    },
    onSaveImageToAblum () {
      if (this.productCanvas && this.productCanvas.saveCanvasToAlbum) {
        this.productCanvas.saveCanvasToAlbum()
      }
      if (this.productCanvas && this.productCanvas.saveCanvasToAlbum) {
        this.productCanvas.saveCanvasToAlbum()
      }
    },
    onLoadCanvasImage (e) {
      this.canvasImageReady = true
    }
  },
  onShareAppMessage (res) {
    return {
      title: this.shareTitle,
      path: `/pages/home?scene=${this.shareScene}`,
      imageUrl: this.shareImage,
      success: res => {},
      fail: () => {},
      complete: () => {}
    }
  }

}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
$color-orange: #ff5a00;
$color-text: #262626;
$color-text-light: #666666;
$color-text-toast: #ffffff;
$color-text-hint: rgba(#333333, 0.8);
$color-divider: #f0f0f0;
$color-bg-gray: #f6f6f6;
$color-bg-toast: rgba(#000000, 0.6);
$color-border: #bbbbbb;
$color-box-shadow: rgba(#000000, 0.08);
$color-bg-btn-save: #222222;

page {
  background-color: $color-bg-gray;
}
.page {
  width: 100%;
  padding-bottom: 30px;
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
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: transparent;
  overflow: hidden;
  padding-top: 200px;
}
.pendingIcon {
  width: 100px;
  height: 100px;
  margin-bottom: 18px;
}
.pendingText {
  font-size: 14px;
  color: $color-text-toast;
  padding: 10px 30px;
  background-color: $color-bg-toast;
  border-radius: 8px;
}
.canvasImageWrapper {
  width: 66.666667vw;
  margin: 30px auto 0;
  border-radius: 8px;
  box-shadow: 0 3px 20px 0 $color-box-shadow;
  overflow: hidden;
}
.productCanvas {
  position: fixed;
  left: 1000px;
  top: 0;
  width: 375px;
  height: 820px;
}
.canvasImage{
  display: block;
  width: 100%;
  opacity: 0;
  transition: opacity 0.25s ease-in-out;
}
.imageVisible {
  opacity: 1;
}
.shopCanvas {
  display: none;
  width: 375px;
  height: 785px;
}
.actionSave {
  margin: 60px auto 25px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.saveHint {
  font-size: 14px;
  color: $color-text-hint;
  margin-bottom: 20px;
}
.btnSave {
  max-width: 320px;
  width: 100%;
  height: 50px;
  line-height: 20px;
  padding: 15px 0;
  text-align: center;
  background-color: $color-bg-btn-save;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  box-shadow: 0 1px 4px 0 $color-box-shadow;
  &::after {
    display: none;
  }
}
.btnIcon {
  width: 19px;
  height: 19px;
  margin-right: 5px;
}
.btnText {
  font-size: 16px;
}

</style>
