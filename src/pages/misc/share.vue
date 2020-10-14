<template>
  <view :class="{
    [$style['page']]: true,
    [$style['disableScroll']]: !isReady
  }">
    <view :class="{[$style['canvasImageWrapper']]: true, [$style['isProduct']]: !!productId, [$style['ready']]: canvasImageReady}">
      <image
        v-if="canvasImage"
        :src="canvasImage"
        mode="widthFix"
        @load="onLoadCanvasImage"
        :class="[$style['canvasImage'], canvasImageReady && $style['imageVisible']]"
        :show-menu-by-longpress="true"></image>

    <view v-if="!isReady && !canvasImageReady" :class="$style['pending']">
        <image
          mode="aspectFit"
          :class="$style['pendingIcon']"
          :src="'https://up.img.heidiancdn.com/o_1ehtu4aarjjg1t5dfa5nrjsg30shop2x.png'|imageUrl(100)"></image>
        <view :class="$style['pendingText']">正在加载素材，请稍等</view>
      </view>
    </view>
    <view :class="$style['containerInnter']">
      <text :class="$style['saveHint']">保存图片，将好货分享给朋友们吧</text>
      <view :class="$style['btnsWrapper']">
        <button
          :class="['button', 'button--round', 'button--orange', $style['btnItem']]"
          hover-class="hover-class"
          open-type="share">
          <text :class="$style['btnText']">分享给好友</text>
        </button>
        <button
          :class="['button', 'button--round', 'button--dark', $style['btnItem']]"
          hover-class="hover-class"
          :disabled="!isReady"
          @tap="onSaveImageToAblum">
          <text :class="['el-icon-download', $style['btnIcon']]"></text>
          <text :class="$style['btnText']">保存图片</text>
        </button>
      </view>
    </view>

    <!-- <view v-if="isReady" :class="$style['actionSave']">
      <text :class="$style['saveHint']">保存图片，将好货分享给朋友们吧</text>
      <button
        :class="['button', 'button--round', 'button--dark', $style['btnSave']]"
        hover-class="hover-class"
        @tap="onSaveImageToAblum">
        <text :class="['el-icon-download', $style['btnIcon']]"></text>
        <text :class="$style['btnText']">保存图片</text>
      </button>
    </view> -->

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
import { handleErr } from '@/utils/errHelper'
import RequiresLogin from '@/mixins/RequiresLogin'
import ShareCanvas from './share'

const SHOP_BG_IMG = 'https://up.img.heidiancdn.com/o_1eib7kl4hise1fom1d0h1lem1qln03.jpg?imageView2/2/w/800/ignore-error/1'

export default {
  name: 'Share',
  mixins: [ RequiresLogin ],
  data() {
    const { product } = getCurrentInstance().router.params
    return {
      isReady: false,
      productId: product || null,
      product: {},
      miniqrUrl: '',
      canvasInstance: null,
      shopCanvas: null,
      canvasImage: '',
      canvasImageReady: false,
      shareScene: ''
    }
  },
  computed: {
    ...mapState(['customer']),
    referralCode () {
      return _.get(this.customer.data, 'referral_code', '')
    },
    appid () {
      return this.$store.state.config.appid
    },
    shareTitle () {
      const prefix = _.get(this.customer.data, 'full_name') || '你的好友'
      const suffix = this.productId ? '给你分享以下好物' : '邀请你成为HeyShop国货大使'
      return prefix + suffix
    },
    shareImage () {
      // return this.productId ? optimizeImage(_.get(this.product, 'image'), 400) : SHOP_BG_IMG
      return optimizeImage(_.get(this.product, 'image'), 400)
    }
  },
  beforeDestroy () {
    this.canvasInstance && this.canvasInstance.stopTask && this.canvasInstance.stopTask()
  },
  onShareAppMessage (res) {
    return {
      title: this.shareTitle,
      path: `/pages/home?scene=${encodeURIComponent(this.shareScene)}`,
      imageUrl: this.shareImage,
      success: res => {},
      fail: () => {},
      complete: () => {}
    }
  },
  async mounted () {
    /**
     * 保证用户已登录且拿到referralCode，再去获取商品信息和后面初始化 share
     */
    try {
      if (!this.customer.data.id) { await this.$store.dispatch('customer/getCustomer') }
      if (this.productId) { await this.fetchProduct() }
      this.getShareScene()
      await this.generateMiniQr()
      this.generateShareImage()
    } catch (err) {
      handleErr(err)
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    getShareScene () {
      // const referralCode = this.customer.data.referral_code
      let scene = `s=share&c=${this.referralCode}`
      if (this.productId) {
        scene += `&r=pdt&id=${this.productId}`
      }
      this.shareScene = scene
    },
    async fetchProduct () {
      // TODO 要处理 404
      const fields = _.join(['id', 'title', 'image'], ',')
      const res = await API.get(`/shopfront/product/${this.productId}/`, {
        params: { fields }
      })
      const product = res.data
      this.product = product
    },
    generateMiniQr () {
      return new Promise(async (resolve, reject) => {
        if (!this.shareScene) {
          reject('缺少参数')
        }
        const isShortScene = /^[a-zA-Z0-9!#$&'()*+,/:;=?@\-._~]{1,32}$/.test(this.shareScene)
        if (!isShortScene) {
          reject('无法生成小程序码, 请尝试使用小程序转发分享')
        }
        try {
          const res = await API.post('/weixin/wacode/', {
            appid: this.appid,
            page: 'pages/home',
            scene: this.shareScene
          })
          const miniqrUrl = optimizeImage(res.data.src, 160)
          this.miniqrUrl = miniqrUrl
          const canvasOptions = !!this.productId ? {
            canvasId: '#productCanvas',
            customer: this.customer.data,
            product: this.product,
            miniqrUrl: this.miniqrUrl,
            isDark: false
          } : {
            canvasId: '#shopCanvas',
            customer: this.customer.data,
            miniqrUrl: this.miniqrUrl,
            isDark: false
          }
          this.canvasOptions = canvasOptions
          resolve(canvasOptions)
        } catch (err) {
          reject(err)
        }
      })
    },
    generateShareImage () {
      this.canvasInstance = new ShareCanvas(this.canvasOptions)
      this.canvasInstance.execGenerate().then((tempFilePath) => {
        this.canvasImage = tempFilePath
        _.delay(() => {
          this.isReady = true
        }, 500)
      }).catch(err => {
        Taro.showToast({
          title: typeof err === 'string' ? err : '图片生成失败',
          icon: 'none'
        })
      })
    },
    onSaveImageToAblum () {
      if (this.canvasInstance && this.canvasInstance.saveCanvasToAlbum) {
        this.canvasInstance.saveCanvasToAlbum()
      }
    },
    onLoadCanvasImage (e) {
      this.canvasImageReady = true
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
$color-white: #ffffff;
$canvas-width: 66.666667vw;
$canvas-height: 138.666667vw;
$canvas-height-product: 145.777778vw;

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
  position: absolute;
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
  width: $canvas-width;
  height: auto;
  min-height: $canvas-height;
  margin: 30px auto 0;
  border-radius: 8px;
  overflow: hidden;
  &.isProduct {
    min-height: $canvas-height-product;
  }
  &.ready {
    box-shadow: 0 3px 20px 0 $color-box-shadow;
  }
}
.productCanvas {
  position: fixed;
  left: 1000px;
  top: 0;
  width: 375px;
  height: 820px;
}
.shopCanvas {
  position: fixed;
  left: 1000px;
  top: 0;
  width: 375px;
  height: 780px;
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
.actionSave {
  margin: 30px auto 25px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.containerInnter {
  margin: 30px auto 25px;
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.saveHint {
  font-size: 14px;
  color: $color-text-hint;
  margin-bottom: 20px;
  text-align: center;
}

.btnsWrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btnItem {
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 4px 0 $color-box-shadow;
  & + & {
    margin-left: 10px;
  }
}
.btnIcon {
  font-size: 19px;
  margin-right: 5px;
}
</style>
