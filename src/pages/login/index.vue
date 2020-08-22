<template>
  <view>
    <button
      type="primary"
      open-type="getPhoneNumber"
      @getPhoneNumber="getPhoneNumber"
    >快速登录</button>
  </view>
</template>

<script>
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
    // 获取 wx.login 的 js_code 一定要在 getPhoneNumber 回调的外面
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
        console.log('登录成功', res)
      } catch(err) {
        console.log('登录失败', _.get(err, 'response.data'))
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

<style lang="scss"></style>
