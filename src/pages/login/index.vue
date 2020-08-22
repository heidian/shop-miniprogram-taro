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
  async mounted() {
    // 获取 wx.login 的 js_code 一定要在 getPhoneNumber 回调的外面
    const { code } = await Taro.login()
    this.code = code
  },
  methods: {
    async getPhoneNumber(e) {
      console.log(e.detail)
      const { errMsg, encryptedData, iv } = e.detail || {}
      if (!encryptedData || !iv) {
        // TODO 处理错误
        console.log('无法获取手机号', errMsg)
        return
      }
      try {
        const res = await this.$store.dispatch('customer/login', {
          appid: 'wx0ebd63bd0a26f767',
          js_code: this.code,
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
        console.log('登录失败', _.get(err, 'response.data.detail'))
      }
    }
  }
}
</script>

<style lang="scss"></style>
