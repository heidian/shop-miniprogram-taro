<template>
  <view class="block--grids" :style="css">
    <view
      v-for="(item, index) in settingsData.grids" :key="index"
      class="grid" :style="gridStyle"
    >
      <view class="grid__image" :style="{
        'paddingTop': paddingTop,
        'backgroundImage': backgroundImageUrl(item.image, 600)
      }"></view>
      <text class="grid__text" v-if="textValue(item.text)">{{ textValue(item.text) }}</text>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        grids: [],  // { image, text }
        gridGap: 0,  // px 整数
        imageRatio: 1,  // 宽高比
        textAlign: 'left',
        columns: 2
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    gridStyle() {
      const style = {}
      const columns = Math.max(1, +this.settingsData.columns || 0)
      const gridGap = +this.settingsData.gridGap || 0
      const textAlign = this.settingsData.textAlign || 'left'
      const widthPercent = (100 / columns).toFixed(6)
      style['width'] = `${widthPercent}%`
      style['padding'] = Taro.pxTransform(`${parseInt(gridGap/2)}px`)
      style['textAlign'] = textAlign
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
      if (_.isString(textObj)) {
        return textObj
      } else if (_.isObject(textObj)) {
        return _.get(textObj, 'value')
      } else {
        return '' + textObj
      }
    }
  },
  filters: {
    // text(textObj) {
    //   if (_.isString(textObj)) {
    //     return textObj
    //   } else if (_.isObject(textObj)) {
    //     return _.get(textObj, 'value')
    //   } else {
    //     return '' + textObj
    //   }
    // }
  }
}
</script>

<style lang="scss">
.block--grids {
  .image {
    display: block;
    width: 100%;
  }
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  .grid {}
  .grid__image {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .grid__text {
    display: block;
    margin-top: 0.5em;
  }
}
</style>
