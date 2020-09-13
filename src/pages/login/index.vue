<template>
  <view :class="$style['page']">
    <image
      :class="$style['decoImage']" mode="aspectFit"
      src="https://up.img.heidiancdn.com/o_1ehtu4aarjjg1t5dfa5nrjsg30shop2x.png"
    ></image>
    <button
      :class="[$style['loginButton'], 'button--round']" type="primary"
      open-type="getPhoneNumber" @getPhoneNumber="getPhoneNumber"
    >微信登录</button>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'

export default {
  name: 'Login',
  components: {},
  data() {
    return {
      code: ''
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
    async getPhoneNumber(e) {
      // console.log(e.detail)
      const { errMsg, encryptedData, iv } = e.detail || {}
      if (!encryptedData || !iv) {
        // TODO 处理错误
        console.log('无法获取手机号', errMsg)
        return
      }
      Taro.showLoading({})
      try {
        const res = await this.$store.dispatch('customer/login', {
          appid: this.appid,
          js_code: this.getJsCode(),
          encryptedData: encryptedData,
          iv: iv,
          grant_type: 'wechat_mini_phone',
          source_name: 'miniprogram',
          context: {
            // ...analytics.apiCampaignContext()
          }
        })
        Taro.hideLoading()
        Taro.navigateBack()
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
    }
  }
}
</script>

<style lang="scss" module>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.decoImage {
  width: 120px;
  height: 120px;
  display: block;
  margin-bottom: 30px;
}
.loginButton {
  width: 80%;
  margin-bottom: 50px;
}
</style>
