<template>
  <view :class="$style['page']">
    <web-view :src="url"></web-view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'

export default {
  data() {
    const { url } = getCurrentInstance().router.params
    return {
      url: decodeURIComponent(url)
    }
  }
}
</script>

<style lang="scss" module>
page {
  //
}
.page {
  //
}
</style>
