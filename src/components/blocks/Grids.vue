<template>
  <view v-if="layout == 'pinterest'" class="block--grids pinterest" :style="css">
    <view v-for="(columnValue, columnIndex) in Array(columns)" :key="columnIndex" class="pinterest-column">
      <view
        v-for="(item, index) in settingsData.grids" :key="index"
        v-if="index % columns === columnIndex"
        class="grid-wrapper" :style="gridWrapperStyle"
      >
        <view class="grid-item" :style="gridItemStyle" @tap="goToUrl(item.url)">
          <image
            v-if="item.image && item.image.src" class="grid__image"
            :src="optimizeImage(item.image, 200)" mode="widthFix"
          ></image>
          <view
            v-if="item.text && item.text.html"
            class="grid__text taro_html" :style="gridTextStyle(item)"
            v-html="sanitizeHtml(item.text.html)"
          ></view>
        </view>
      </view>
    </view>
  </view>
  <view v-else :class="{'block--grids': true, 'scroll': layout === 'scroll'}" :style="css">
    <view
      v-for="(item, index) in settingsData.grids" :key="index"
      class="grid-wrapper" :style="gridWrapperStyle"
    >
      <view class="grid-item" :style="gridItemStyle" @tap="goToUrl(item.url)">
        <view v-if="item.image && item.image.src" class="grid__image" :style="gridImageStyle(item)"></view>
        <view
          v-if="item.text && item.text.html"
          class="grid__text taro_html" :style="gridTextStyle(item)"
          v-html="sanitizeHtml(item.text.html)"
        ></view>
      </view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { sanitizeHtml } from '@/utils/formatters'
import { goToUrl } from '@/utils/url'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        layout: 'grids',  // scroll|grids|pinterest
        backgroundColor: null,  // 卡片格子的底色
        grids: [],  // { image: { src, metafield }, text: { html } , url }
        gridGap: 0,  // px 整数
        imageRatio: 1,  // 宽高比
        columns: 1
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    layout() {
      const layout = this.settingsData.layout || ''
      return /^(scroll|grids|pinterest)$/.test(layout) ? layout : 'grids'
    },
    columns() {
      const columns = Math.max(1, +this.settingsData.columns || 0)
      return columns
    },
    gridWrapperStyle() {
      const style = {}
      if (this.layout === 'pinterest') {
        // style['width'] = '100%'
      } else {
        const widthPercent = (100 / this.columns).toFixed(6)
        style['width'] = `${widthPercent}%`
      }
      const gridGap = +this.settingsData.gridGap || 0
      style['padding'] = Taro.pxTransform(`${parseInt(gridGap/2)}px`)
      return style
    },
    gridItemStyle() {
      return this.settingsData.backgroundColor ? {
        'backgroundColor': this.settingsData.backgroundColor
      } : {}
    },
    // paddingTop() {
    //   const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
    //   return `${percent}%`
    // }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    goToUrl,
    sanitizeHtml,
    gridImageStyle(item) {
      const percent = (100 / (+this.settingsData.imageRatio || 1)).toFixed(6)
      const paddingTop = `${percent}%`
      return {
        'paddingTop': paddingTop,
        'backgroundImage': this.backgroundImageUrl(item.image, 200)
      }
    },
    gridTextStyle(item) {
      // 现在在 css 里直接加上了固定的 padding
      return {
        // 如果有底色, 就加一个左右边距
        // 'padding': this.settingsData.backgroundColor ? '0 0.5em 0.5em' : ''
      }
    },
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
    // 始终加上 padding
    padding: 0.5em 0.5em;
  }
  &.pinterest {
    flex-wrap: nowrap;
    .grid__image {
      width: 100%;
      height: auto;
      display: block;
    }
  }
  .pinterest-column {
    flex: 1;
  }
}
</style>
