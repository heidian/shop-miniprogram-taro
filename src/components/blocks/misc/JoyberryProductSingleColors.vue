<template>
  <div :style="css">
    <div>JoyberryProductSingleColors</div>
  </div>
</template>

<script>
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

/* 页面私有组件放在页面同一个目录下,
因为 taro 无法实现 vue 的 scoped css, 样式写在页面和组件里都可以, 注意 class 冲突就行 */
export default {
  name: 'JoyberryProductSingleColors',
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    },
    product: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      //
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
</script>
