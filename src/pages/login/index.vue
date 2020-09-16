<template>
  <view :class="$style['page']">
    <view :class="$style['header']">
      <image src="https://up.img.heidiancdn.com/o_1cbb77mku1p0k5nko010gt1ehb0logo.svg" :class="$style['logo']" mode="aspectFill"></image>
      <view :class="$style['title']">登录账户</view>
    </view>
    <image
      :class="$style['decoImage']" mode="aspectFit"
      src="https://up.img.heidiancdn.com/o_1ehtu4aarjjg1t5dfa5nrjsg30shop2x.png"></image>
    <view :class="$style['footer']">
      <view :class="$style['rederral']">
        <input type="text" :class="$style['referralCode']" v-model="tmpCode" placeholder="请输入邀请码（可选填）" :disabled="!!referrerData">
        <button
          v-if="!referralCode"
          type="primary"
          :class="[$style['suffixBtn'], 'btn', 'button--dark']"
          hover-class="button-hover"
          :disabled="!!pending || !tmpCode || !!referrerData"
          @tap="getReferrerInfo"
          >确定</button>
      </view>
      <button
        :class="[$style['loginButton']]"
        hover-class="button-hover"
        type="primary"
        open-type="getPhoneNumber" @getPhoneNumber="getPhoneNumber">
        <image src="https://up.img.heidiancdn.com/o_1cgtnj1nadol7n31b8n1lfidgb0wechat.png" :class="$style['buttonIcon']"></image>
        <text>微信登录</text>
      </button>
    </view>
    <hs-dialog :visible.sync="dialogVisible">
      <view :class="$style['referralHeader']" slot="header">确认邀请人</view>
      <view :class="$style['referralBody']">
        <image :class="$style['referralAvatar']" :src="optimizeImage(referrerData ? referrerData.avatar : '', 100)"></image>
        <view :class="$style['referralName']">{{ referrerData && referrerData.full_name }}</view>
        <view :class="$style['referralCodeText']">{{ tmpCode }}</view>
      </view>
      <view :class="$style['referralFooter']" slot="footer">
        <button :class="[$style['dialogFooterBtn']]" @tap="dialogVisible = false">取消</button>
        <button :class="[$style['dialogFooterBtn']]" @tap="onEnsure">确定</button>
      </view>
    </hs-dialog>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentPages }from '@tarojs/taro'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import { optimizeImage, backgroundImageUrl, DEFAULT_AVATAR } from '@/utils/image'

import HsDialog from '@/components/HsDialog'

export default {
  name: 'Login',
  components: {
    'hs-dialog': HsDialog
  },
  data() {
    return {
      code: '',
      pending: false,
      referralCode: '',
      tmpCode: '',
      referrerData: null,
      dialogVisible: false
    }
  },
  computed: {
    appid() {
      return this.$store.state.config.appid
    }
  },
  async mounted() {
    // 获取 Taro.login 的 js_code 一定要在 getPhoneNumber 回调的外面
    this.getJsCode()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    async getPhoneNumber(e) {
      const { errMsg, encryptedData, iv } = e.detail || {}
      if (!encryptedData || !iv) {
        // TODO 处理错误
        console.log('无法获取手机号', errMsg)
        handleErr(errMsg)
        return
      }
      Taro.showLoading({})
      const context = {}
      if (!!this.referrerData && !!this.referralCode) {
        context.referrer__referral_code = this.referralCode
      }
      try {
        const res = await this.$store.dispatch('customer/login', {
          appid: this.appid,
          js_code: this.getJsCode(),
          encryptedData: encryptedData,
          iv: iv,
          grant_type: 'wechat_mini_phone',
          source_name: 'miniprogram',
          context
        })
        Taro.hideLoading()
        const pages = getCurrentPages()
        if (pages.length > 1) {
          Taro.navigateBack()
        } else {
          Taro.switchTab({ url: '/pages/home/index' })
        }

      } catch(err) {
        Taro.hideLoading()
        console.log('登录失败', _.get(err, 'response.data', ('' + err)))
      }
    },
    getJsCode() {
      const code = this.code
      // 取完以后得换一个
      Taro.login({
        success: ({ code }) => { this.code = code }
      })
      return code
    },
    async getReferrerInfo () {
      try {
        const res = await API.get(`customers/referrer/${this.tmpCode}/`)
        const referrerData = res.data || {}
        this.referrerData = referrerData
        this.dialogVisible = true
      } catch (err) {
        console.log(err)
        handleErr('验证码已失效，请联系好友重新获取。或跳过输入验证码，直接微信登录！')
      }
    },
    onEnsure () {
      this.referralCode = this.tmpCode
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';

.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  overflow: hidden;
  padding: 30px 25px 50px;
}
.header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.logo {
  width: 156px;
  height: 23px;
}
.title {
  font-size: 14px;
  margin-top: 10px;
  color: $color-text-light;
}
.decoImage {
  margin-top: -30px;
  width: 100px;
  height: 100px;
  display: block;
}
.footer {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.rederral,
.loginButton {
  width: 100%;
}
.rederral {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.referralCode {
  flex: 1;
  padding: 11px 15px;
  line-height: 22px;
  font-size: 14px;
  height: 44px;
  border: 2px solid $color-divider;
}
.suffixBtn {
  width: 70px;
  margin-left: 10px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 0;
}
.loginButton {
  border-radius: 0;
}
.buttonIcon {
  width: 16px;
  height: 16px;
  margin-right: 3px;
  vertical-align: middle;
}

.referralHeader {
  width: 100%;
  padding: 30px 20px 10px;
  font-size: 18px;
  font-weight: 600;
  color: $color-text;
  text-align: center;
}
.referralBody {
  width: 100%;
  padding: 10px 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.referralAvatar {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
  border-radius: 30px;
}
.referralName {
  font-size: 15px;
  color: $color-text;
  font-weight: 600;
  margin-bottom: 10px;
}
.referralCodeText {
  font-size: 12px;
  color: $color-text-light;
}
.referralFooter {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-top: 1px solid $color-divider;
}
.dialogFooterBtn {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 15px;
  line-height: 26px;
  font-weight: 600;
  & + & {
    border-left: 1px solid $color-divider;
  }
}
</style>
