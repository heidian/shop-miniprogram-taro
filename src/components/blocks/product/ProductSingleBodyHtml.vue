<template>
  <view :class="$style['section']" :style="css">
    <view :class="$style['sectionTitle']">图文详情</view>
    <!-- <view v-if="bodyHtml" class="'taro_html'" :class="$style['productHtml']" v-html="bodyHtml"></view> -->
    <wxparse v-if="shouldParseHtml" :html="bodyHtml" />
    <view v-else v-html="bodyHtml"></view>
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
    shouldParseHtml() {
      return Taro.getEnv() === Taro.ENV_TYPE.WEAPP
    },
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
// .productHtml {
//   padding: 0 15px;
// }
</style>
