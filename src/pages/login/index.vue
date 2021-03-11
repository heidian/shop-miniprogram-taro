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
      <button
        :class="['button', $style['loginButton']]" type="primary"
        open-type="getPhoneNumber" @getPhoneNumber="getPhoneNumber"
      >
        <image
          src="https://up.img.heidiancdn.com/o_1cgtnj1nadol7n31b8n1lfidgb0wechat.png"
          :class="$style['buttonIcon']"
        ></image>微信登录
      </button>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentPages } from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'

export default {
  name: 'Login',
  components: {},
  data() {
    return {
      code: '',
      pending: false,
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
    async getPhoneNumber(e) {
      const { errMsg, encryptedData, iv } = e.detail || {}
      if (!encryptedData || !iv) {
        // TODO 处理错误
        console.log('无法获取手机号', errMsg)
        Taro.showModal({
          title: '出错了',
          content: errMsg,
          showCancel: false,
          success: function(res) {}
        })
        return
      }
      Taro.showLoading({})
      try {
        const res = await this.$store.dispatch('customer/login', {
          appid: this.appid,
          js_code: this.getJsCode(),
          encryptedData: encryptedData,
          iv: iv,
          grant_type: 'wechat_mini_phone'
        })
        Taro.hideLoading()
        const pages = getCurrentPages()
        if (pages.length > 1) {
          Taro.navigateBack()
        } else {
          Taro.switchTab({ url: '/pages/home' })
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
  :global(.button) {
    border-radius: 0;
  }
}
.loginButton {
  width: 100%;
}
.buttonIcon {
  width: 16px;
  height: 16px;
  margin-right: 3px;
  vertical-align: middle;
}
</style>
