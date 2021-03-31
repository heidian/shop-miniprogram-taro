<template>
  <view class="block--accordion" :style="css">
    <view
      v-for="(item, index) in settingsData.accordion" :key="index"
      :class="{'accordion__item': true, 'expanded': expandedIndex === index}"
      :style="settingsData.dividerColor ? { 'borderColor': settingsData.dividerColor } : {}"
    >
      <view
        class="accordion__title"
        :style="settingsData.titleBackgroundColor ? {
          'backgroundColor': settingsData.titleBackgroundColor,
          ...getTextStyle(item.title)
        } : {
          ...getTextStyle(item.title)
        }"
        @tap="onTapTitle(index)"
      >
        <!-- textStyle 放在上面, 这样箭头和标题的颜色就一样了 -->
        <text>{{ getTextValue(item.title) }}</text>
        <text class="accordion__icon el-icon-arrow-down" v-if="expandedIndex === index"></text>
        <text class="accordion__icon el-icon-arrow-right" v-else></text>
      </view>
      <view
        class="accordion__content taro_html"
        :style="settingsData.contentBackgroundColor ? { 'backgroundColor': settingsData.contentBackgroundColor } : {}"
        v-html="getHtmlValue(item.content)"
      ></view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
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
        accordion: [],  // { title: { value }, content: { html } }
        titleBackgroundColor: null,
        contentBackgroundColor: null,
        dividerColor: null,
      })
    }
  },
  data() {
    return {
      expandedIndex: 0
    }
  },
  computed: {
    //
  },
  methods: {
    getTextValue(textObj) {
      return _.get(textObj, 'value', '')
    },
    getTextStyle(textObj) {
      return _.get(textObj, 'style', {})
    },
    getHtmlValue(htmlObj) {
      return _.get(htmlObj, 'html', '')
    },
    onTapTitle(index) {
      if (this.expandedIndex === index) {
        this.expandedIndex = null
      } else {
        this.expandedIndex = index
      }
    }
  }
}
</script>

<style lang="scss">
.block--accordion {
  .accordion__item {
    border: 1px solid transparent;
    + .accordion__item {
      border-top-width: 0;
    }
  }
  .accordion__title {
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .accordion__content {
    padding: 15px;
    display: none;
  }
  .accordion__item.expanded .accordion__content {
    display: block;
  }
}
</style>
