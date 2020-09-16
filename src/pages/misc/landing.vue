<template>
  <view :class="{
    [$style['page']]: true,
    [$style['disableScroll']]: !isReady
  }">
    <view v-if="!isReady" :class="$style['pending']">
      <image
        mode="aspectFit"
        :class="$style['pendingIcon']"
        :src="'https://up.img.heidiancdn.com/o_1ehtu4aarjjg1t5dfa5nrjsg30shop2x.png'|imageUrl(100)"></image>
      <view :class="$style['pendingText']">正在加载...</view>
    </view>
    <view v-else-if="type === 'product'" :class="$style['container']">
      <image :class="$style['title']" mode="aspectFill" :src="titleLogo|imageUrl(180)"></image>
      <image :class="$style['referralAvatar']" mode="aspectFill" :src="(referrerData.avatar || DEFAULT_AVATAR)|imageUrl(180)"></image>
      <view :class="$style['referralFullname']">
        <text style="font-weight: bold;">{{ referrerData.full_name || '你的朋友' }}</text><text>给你分享以下好物</text>
      </view>
      <view :class="$style['productImageWrapper']">
        <image :class="$style['productImage']" mode="aspectFill" :src="product.image|imageUrl(180)"></image>
      </view>
      <view :class="$style['productTitle']">{{ product.title }}</view>
      <image :class="$style['tags']" mode="aspectFit" :src="tagsUrl|imageUrl(400)"></image>
      <view :class="$style['btnsWrapper']">
        <navigator
          :url="`/pages/product/index?id=${productId}`"
          :class="{[$style['btnItem']]: true, [$style['btnOrange']]: true}">购买商品</navigator>
        <navigator
          :url="`/pages/home/index`" open-type="switchTab" :class="[$style['btnItem'], $style['btnBlack']]">随便逛逛</navigator>
      </view>
    </view>
    <view v-else :class="[$style['container'], $style['containerFull']]">
      <view :class="$style['containerInnter']">
        <image :class="$style['title']" mode="aspectFill" :src="titleLogo|imageUrl(180)"></image>
        <image :class="$style['referralAvatar']" mode="aspectFill" :src="(referrerData.avatar || DEFAULT_AVATAR)|imageUrl(180)"></image>
        <view :class="$style['referralFullname']">
          <text style="font-weight: bold;">{{ referrerData.full_name || '你的朋友' }}</text><text>邀请你成为HeyShop合伙人</text>
        </view>
      </view>
      <view :class="$style['card']">
        <image :class="$style['guohuoLogo']" mode="widthFix" :src="guohuoLogo|imageUrl(400)"></image>
        <view :class="$style['guohuoTitle']">
          <view :class="$style['decoLeft']"></view>
          <text :class="$style['text']">合伙人权益</text>
          <view :class="$style['decoRight']"></view>
        </view>
        <view :class="$style['grid']">
          <view v-for="item in rights" :key="item.title"  :class="$style['gridItem']">
            <image :class="$style['gridIcon']" mode="aspectFill" :src="item.icon|imageUrl(50)"></image>
            <view :class="$style['gridCaption']">
              <text :class="$style['gridTitle']">{{ item.title }}</text>
              <text :class="$style['gridSubtitle']">{{ item.subtitle }}</text>
            </view>
          </view>
        </view>
      </view>
      <view :class="$style['containerInnter']">
        <text :class="$style['btnHint']">升级为国货大使，更多线下活动等你参与</text>
        <view :class="$style['btnsWrapper']">
          <navigator
            :url="`/pages/product/index?id=${productId}`"
            :class="{[$style['btnItem']]: true, [$style['btnGolden']]: true}">立即升级</navigator>
          <navigator
            :url="`/pages/home/index`" open-type="switchTab" :class="[$style['btnItem'], $style['btnBlack']]">随便逛逛</navigator>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl, DEFAULT_AVATAR } from '@/utils/image'

export default {
  name: 'Landing',
  data () {
    const { product: productId, code: referralCode } = getCurrentInstance().router.params
    const type = !!productId ? 'product' : 'shop'
    return {
      DEFAULT_AVATAR,
      isReady: false,
      type,
      titleLogo: type === 'product' ? 'https://up.img.heidiancdn.com/o_1ehu3f2q4fb5tmt19ql1gcnnic0hite2x.png' : 'https://up.img.heidiancdn.com/o_1ehu0lfh57rk17obfpa128411ka0mber2x.png',
      guohuoLogo: 'https://up.img.heidiancdn.com/o_1ehu0lfh41rbh1g93e7i2v9bvn0copy2x.png',
      productId,
      referralCode,
      product: {},
      referrerData: {},
      tagsUrl: 'https://up.img.heidiancdn.com/o_1eh9lrgqd10eok5o9mgbv31s1d0oup22x.png',
      rights: [
        {
          icon: 'https://up.img.heidiancdn.com/o_1ehu0lfgv1pdsbk55lcstn1ta0.png',
          title: '自购省钱',
          subtitle: '高质低价超划算'
        },
        {
          icon: 'https://up.img.heidiancdn.com/o_1ehu0lfgs98u1dsb1cjq16s21e610.png',
          title: '分享多奖',
          subtitle: '多分享多奖励'
        },
        {
          icon: 'https://up.img.heidiancdn.com/o_1ehu0lfh380t198fia11l0l1t140up522x.png',
          title: '畅享包邮',
          subtitle: '5次包邮不凑单'
        },
        {
          icon: 'https://up.img.heidiancdn.com/o_1ehu0lfh21n5461knmv6k71ecb0scount.png',
          title: '专属折扣',
          subtitle: '百元优惠月月领'
        }
      ]
    }
  },
  created () {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
    Taro.setNavigationBarTitle({
      title: this.type === 'product' ? '分享' : 'HEYSHOP'
    })
  },
  computed: {},
  async mounted () {
    if (this.type === 'product') {
      await this.fetchProduct()
    }
    await this.getReferrerInfo()
    this.isReady = true
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    async fetchProduct () {
      const fields = _.join(['id', 'title', 'image'], ',')
      try {
        const res = await API.get(`/shopfront/product/${this.productId}/`, {
          params: { fields }
        })
        const product = res.data
        this.product = product
      } catch (err) {
        console.log(err)
      }
    },
    async getReferrerInfo () {
      try {
        const res = await API.get(`customers/referrer/${this.referralCode}/`)
        const referrerData = res.data || {}
        this.referrerData = referrerData
      } catch (err) {
        console.log(err)
      }
    },
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
$color-text: #262626;
$color-text-light: #303030;
$color-text-hint: rgba(#333333, 0.8);
$color-text-toast: #ffffff;
$color-bg: #f6f6f6;
$color-bg-grey: #aaaaaa;
$color-bg-toast: rgba(#000000, 0.6);
$color-border: #bbbbbb;
$color-box-shadow: rgba(#000000, 0.08);
$color-orange: #ff5a00;
$color-black: #222222;
$color-golden: #e6caa5;
$color-brown: #5c411a;
$color-white: #ffffff;

page {
  background-color: $color-bg;
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

.container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  color: $color-text;
  &.containerFull {
    padding-left: 0;
    padding-right: 0;
  }
}
.containerInnter {
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.title {
  width: 170px;
  height: 60px;
  margin-bottom: 20px;
}
.referralAvatar {
  width: 50px;
  height: 50px;
  margin-bottom: 5px;
  border-radius: 25px;
  overflow: hidden;
}
.referralFullname {
  font-size: 14px;
  color: $color-text-light;
  line-height: 1.4;
  margin-bottom: 15px;
}

.productImageWrapper {
  width: 100%;
  padding-top: 100%;
  position: relative;
  margin-bottom: 20px;
}
.productImage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $color-bg-grey;
}
.productTitle {
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 10px;
}
.tags {
  width: 100%;
  height: 20px;
  margin-bottom: 40px;
}
/* 邀请合伙 */
.card {
  width: 100%;
  background-color: $color-white;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 100px;
}
.guohuoLogo {
  width: 100%;
  margin-bottom: 25px;
  height: auto;
}
.guohuoTitle {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 20px;
  color: $color-text;
  font-weight: 600;
}
.decoLeft,
.decoRight {
  position: relative;
  width: 36px;
  border-top: 1px solid;
}
.decoLeft {
  margin-right: 20px;
}
.decoRight {
  margin-left: 20px;
}
.decoLeft::after {
  content: "";
  display: block;
  position: absolute;
  top: 50%;
  right: -10px;
  width: 0;
  height: 0;
  border: 2px solid;
  transform-origin: center center;
  transform: translateY(-50%) rotate(45deg);
}
.decoRight::before {
  content: "";
  display: block;
  position: absolute;
  top: 50%;
  left: -10px;
  width: 0;
  height: 0;
  border: 2px solid;
  transform-origin: center center;
  transform: translateY(-50%) rotate(45deg);
}

.grid {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}
.gridItem {
  width: 45%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  &:nth-child(1),
  &:nth-child(2) {
    margin-bottom: 30px;
  }
}
.gridIcon {
  width: 44px;
  height: 44px;
  overflow: hidden;
  border-radius: 50%;
}
.gridCaption {
  margin-left: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gridTitle {
  font-size: 16px;
}
.gridSubtitle {
  font-size: 12px;
  color: $color-text-light;
}

.btnsWrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.btnHint {
  font-size: 14px;
  color: $color-text-hint;
  margin-bottom: 15px;
}
.btnItem {
  max-width: 160px;
  flex: 1;
  height: 50px;
  line-height: 20px;
  padding: 15px 0;
  text-align: center;
  background-color: $color-black;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  box-shadow: 0 1px 4px 0 $color-box-shadow;
  &::after {
    display: none;
  }
  & + & {
    margin-left: 10px;
  }
}
.btnText {
  color: $color-white;
  font-size: 16px;
}
.btnOrange {
  background-color: $color-orange;
}
.btnBlack {
  background-color: $color-black;
}
.btnGolden {
  background-color: $color-golden;
  .btnText {
    color: $color-brown;
  }
}
</style>
