<template>
  <view></view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import tinycolor from 'tinycolor2'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        frontColor: '#000000',  // 顶部状态栏文字色, 只支持 #000000 和 #ffffff
        backgroundColor: '#ffffff',  // 顶部状态栏背景色
      })
    }
  },
  mounted() {
    const colors = {}
    _.forEach(['frontColor', 'backgroundColor'], (colorName) => {
      if (this.settingsData[colorName]) {
        // setNavigationBarColor 只接受 hex 格式的颜色
        colors[colorName] = tinycolor(this.settingsData[colorName]).toHexString()
      }
    })
    Taro.setNavigationBarColor(colors)
    // 只有小程序支持 setBackgroundColor
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP && this.settingsData.backgroundColor) {
      Taro.setBackgroundColor({
        backgroundColorTop: tinycolor(this.settingsData.backgroundColor).toHexString()
      })
    }
  }
}
</script>

<style lang="scss"></style>
