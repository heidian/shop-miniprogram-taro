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
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
    }
  },
  mounted() {
    Taro.setNavigationBarColor(this.settingsData)
    if (this.settingsData.backgroundColor) {
      Taro.setBackgroundColor({
        backgroundColorTop: this.settingsData.backgroundColor
      })
    }
  }
}
</script>

<style lang="scss"></style>
