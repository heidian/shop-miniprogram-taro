<template>
  <view class="block--text" :style="styleData">
    <view class="text">{{ settingsData.text|text }}</view>
  </view>
</template>

<script>
import _ from 'lodash'

export default {
  props: {
    styleData: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  methods: {
    //
  },
  filters: {
    text(textObj) {
      if (_.isString(textObj)) {
        return textObj
      } else if (_.isObject(textObj)) {
        return _.get(textObj, 'value')
      } else {
        return '' + textObj
      }
    }
  }
}
</script>

<style lang="scss">
.block--text {
  .text {
    display: block;
    width: 100%;
  }
}
</style>
