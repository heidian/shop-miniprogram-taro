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
        frontColor: '#000000',  // 顶部状态栏文字色
        backgroundColor: '#ffffff',  // 顶部状态栏背景色
      })
    }
  },
  mounted() {
    const colors = {}
    _.forEach(['frontColor', 'backgroundColor'], (colorName) => {
      if (this.settingsData[colorName]) {
        colors[colorName] = tinycolor(this.settingsData[colorName]).toHexString()
      }
    })
    // setNavigationBarColor 只接受 hex 格式的颜色
    Taro.setNavigationBarColor(colors)
    // if (this.settingsData.backgroundColor) {
    //   Taro.setBackgroundColor({
    //     backgroundColorTop: this.settingsData.backgroundColor
    //   })
    // }
  }
}
</script>

<style lang="scss"></style>
