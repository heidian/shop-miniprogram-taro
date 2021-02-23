<template>
  <view></view>
</template>

<script>
import Taro from '@tarojs/taro'
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
    Taro.setNavigationBarColor(this.settingsData)
    // if (this.settingsData.backgroundColor) {
    //   Taro.setBackgroundColor({
    //     backgroundColorTop: this.settingsData.backgroundColor
    //   })
    // }
  }
}
</script>

<style lang="scss"></style>
