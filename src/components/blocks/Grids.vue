<template>
  <view :class="{'block--grids': true, 'scroll': layout === 'scroll'}" :style="css">
    <view
      v-for="(item, index) in settingsData.grids" :key="index"
      class="grid-wrapper" :style="gridStyle"
      @tap="goToUrl(item.url)"
    >
      <view
        class="grid-item"
        :style="settingsData.backgroundColor ? { 'backgroundColor': settingsData.backgroundColor } : {}"
      >
        <view
          v-if="item.image && item.image.src"
          class="grid__image"
          :style="{
            'paddingTop': paddingTop,
            'backgroundImage': backgroundImageUrl(item.image, 200)
          }"
        ></view>
        <text
          v-if="item.text && item.text.value"
          class="grid__text" :style="textStyle(item.text)"
        >{{ textValue(item.text) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import parseUrl from '@/utils/parseUrl'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        layout: 'grids',  // scroll|grids
        backgroundColor: null,  // 卡片格子的底色
        grids: [],  // { image: { src, metafield }, text: { value } , url }
        gridGap: 0,  // px 整数
        imageRatio: 1,  // 宽高比
        textAlign: '',  // left|right|center
        columns: 2
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    layout() {
      // scroll 或者是 grids
      return this.settingsData.layout || 'grids'
    },
    gridStyle() {
      const style = {}
      const columns = Math.max(1, +this.settingsData.columns || 0)
      const gridGap = +this.settingsData.gridGap || 0
      const textAlign = this.settingsData.textAlign || ''
      const widthPercent = (100 / columns).toFixed(6)
      style['width'] = `${widthPercent}%`
      style['padding'] = Taro.pxTransform(`${parseInt(gridGap/2)}px`)
      if (textAlign) {
        style['textAlign'] = textAlign
      }
      return style
    },
    paddingTop() {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      return `${percent}%`
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    textValue(textObj) {
      // if (_.isNil(textObj)) {
      //   return ''
      // } else if (_.isString(textObj)) {
      //   return textObj
      // } else if (_.isObject(textObj)) {
      //   return _.get(textObj, 'value')
      // } else {
      //   return '' + textObj
      // }
      return _.get(textObj, 'value', '')
    },
    textStyle(textObj) {
      const style = _.get(textObj, 'style', {})
      // 如果有底色, 就加一个左右边距
      if (this.settingsData.backgroundColor) {
        style['paddingLeft'] = '0.5em'
        style['paddingRight'] = '0.5em'
      }
      return style
    },
    goToUrl(url) {
      const parse = parseUrl(url)
      if (parse.openType === 'switchTab') {
        Taro.switchTab({ url: parse.url })
      } else if (parse.openType === 'navigate') {
        Taro.navigateTo({ url: parse.url })
      }
    }
  },
  filters: {}
}
</script>

<style lang="scss">
.block--grids {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  &.scroll {
    flex-wrap: nowrap;
    overflow-x: scroll;
    > .grid-wrapper {
      flex: none;
    }
  }
  .grid-wrapper {
    display: block;
  }
  .grid-item {
    display: block;
  }
  .grid__image {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .grid__text {
    display: block;
  }
  .grid__image + .grid__text {
    margin-top: 0.5em;
  }
}
</style>
