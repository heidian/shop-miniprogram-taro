<template>
  <view :class="$style['formWrapper']" :style="css">
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
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentPages } from '@tarojs/taro'
import { API } from '@/utils/api'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  computed: {},
  methods: {
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
  }
}
</script>

<style lang="scss" module>
.formWrapper {
  //
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
