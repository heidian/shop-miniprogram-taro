<template>
  <view :class="$style['section']" :style="css">
    <view :class="$style['sectionTitle']">图文详情</view>
    <!-- <wxparse v-if="shouldParseHtml" :html="bodyHtml"></wxparse>
    <view v-else v-html="bodyHtml" :class="$style['h5BodyHtml']"></view> -->
    <view v-html="bodyHtml" class="taro_html"></view>
  </view>
</template>

<script>
// import '@tarojs/taro/html.css'
import _ from 'lodash'
import Taro from '@tarojs/taro'

export default {
  name: 'ProductSingleBodyHtml',
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
      return this.product.body_html_mobile || this.product.body_html
    },
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.section {
  overflow: hidden;
  background-color: #ffffff;
}
.sectionTitle {
  font-weight: bold;
  font-size: 15px;
  padding: 15px 15px 10px;
  text-align: center;
}
// .h5BodyHtml {
//   img {
//     max-width: 100%;
//     display: block;
//   }
// }
</style>
