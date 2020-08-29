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
      <text class="grid__text">{{ item.text|text }}</text>
    </view>
  </view>
</template>

<script>
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  props: {
    css: {
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
  computed: {
    gridStyle() {
      const style = {}
      const columns = Math.max(1, +this.settingsData.columns || 0)
      const gridGap = +this.settingsData.gridGap || 0
      const textAlign = this.settingsData.textAlign || 'left'
      const widthPercent = (100 / columns).toFixed(6)
      style['width'] = `${widthPercent}%`
      style['padding'] = `${parseInt(gridGap/2)}px`
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
    backgroundImageUrl
  },
  filters: {
    text(textObj) {
      // 这个没用到
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
    margin-bottom: 0.5em;
  }
}
</style>
