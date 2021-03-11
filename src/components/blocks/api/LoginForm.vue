<template>
  <view :class="$style['formWrapper']" :style="css">
    <button
      :class="['button', $style['loginButton']]" type="primary"
      :style="buttonStyle"
      open-type="getPhoneNumber" @getPhoneNumber="getPhoneNumber"
    >
      <!-- <image
        src="https://up.img.heidiancdn.com/o_1cgtnj1nadol7n31b8n1lfidgb0wechat.png"
        :class="$style['buttonIcon']"
      ></image> -->
      微信快捷登录
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
      default: () => ({
        buttonTextColor: null,
        buttonBackgroundColor: null,
        buttonBorderRadius: null,
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    buttonStyle() {
      const style = {}
      if (+this.settingsData.buttonBorderRadius || this.settingsData.buttonBorderRadius + '' === '0') {
        style['borderRadius'] = Taro.pxTransform(`${+this.settingsData.buttonBorderRadius}px`)
      }
      if (this.settingsData.buttonTextColor) {
        style['color'] = this.settingsData.buttonTextColor
      }
      if (this.settingsData.buttonBackgroundColor) {
        style['backgroundColor'] = this.settingsData.buttonBackgroundColor
      }
      return style
    }
  },
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
  padding: 20px;
}
.loginButton {
  width: 100%;
  display: block;
  &:global(.button-hover) {
    opacity: 0.8;
  }
}
// .buttonIcon {
//   width: 16px;
//   height: 16px;
//   margin-right: 1em;
//   vertical-align: middle;
// }
</style>
