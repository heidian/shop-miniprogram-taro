<template>
  <view :class="$style['formWrapper']" :style="css">
    <button
      :class="['button', $style['loginButton']]" type="primary"
      :style="buttonStyle" :disabled="pending"
      open-type="getPhoneNumber" @getPhoneNumber="getPhoneNumber" @tap="pending=true"
    >
      <!-- <image
        src="https://up.img.heidiancdn.com/o_1cgtnj1nadol7n31b8n1lfidgb0wechat.png"
        :class="$style['buttonIcon']"
      ></image> -->
      <template v-if="pending"><text class="el-icon-loading"></text> 正在获取微信信息</template>
      <template v-else>微信快捷登录</template>
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
    return {
      code: '',
      pending: false,
    }
  },
  computed: {
    appid() {
      return this.$store.state.config.appid
    },
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
  async mounted() {
    // 获取 Taro.login 的 js_code 一定要在 getPhoneNumber 回调的外面
    this.getJsCode()
  },
  methods: {
    getJsCode() {
      const code = this.code
      // 取完以后得换一个
      Taro.login({
        success: ({ code }) => { this.code = code }
      })
      return code
    },
    async getPhoneNumber(e) {
      const { errMsg, encryptedData, iv } = e.detail || {}
      if (!encryptedData || !iv) {
        // TODO 处理错误
        this.pending = false
        console.log('无法获取手机号', errMsg)
        Taro.showModal({
          title: '出错了',
          content: errMsg,
          showCancel: false,
          success: function(res) {}
        })
        return
      }
      Taro.showLoading({ title: '登录中' })
      try {
        const res = await this.$store.dispatch('customer/login', {
          appid: this.appid,
          js_code: this.getJsCode(),
          encryptedData: encryptedData,
          iv: iv,
          grant_type: 'wechat_mini_phone'
        })
        this.pending = false
        Taro.hideLoading()
        const pages = getCurrentPages()
        if (pages.length > 1) {
          Taro.navigateBack()
        } else {
          Taro.switchTab({ url: '/pages/home' })
        }
      } catch(err) {
        this.pending = false
        Taro.hideLoading()
        Taro.showModal({
          title: '登录失败',
          content: JSON.stringify(_.get(err, 'response.data', ('' + err))),
          showCancel: false,
          success: function(res) {}
        })
      }
    }
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
