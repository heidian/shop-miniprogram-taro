<template>
  <view :style="css">
    <!-- <wxparse v-if="shouldParseHtml" :html="bodyHtml"></wxparse>
    <view v-else v-html="bodyHtml" :class="$style['h5BodyHtml']"></view> -->
    <view v-html="bodyHtml" class="taro_html"></view>
  </view>
</template>

<script>
// import '@tarojs/taro/html.css'
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { sanitizeHtml } from '@/utils/formatters'

export default {
  name: 'PageSingleBodyHtml',
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    },
    page: {
      tyoe: Object,
      required: true,
    },
  },
  data() {
    return {}
  },
  computed: {
    // shouldParseHtml() {
    //   return Taro.getEnv() === Taro.ENV_TYPE.WEAPP
    // },
    bodyHtml() {
      return sanitizeHtml(this.page.body_html)
    },
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
// .h5BodyHtml {
//   img {
//     max-width: 100%;
//     display: block;
//   }
// }
</style>
