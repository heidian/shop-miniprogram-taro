<template>
  <view :style="css">
    <view v-if="pending" style="text-align: center; padding: 5px;">
      <text class="el-icon-loading"></text>
    </view>
    <view v-else-if="siblingProducts.length > 0" :class="$style['section']">
      <view :class="$style['sectionTitle']">同款颜色</view>
      <view :class="$style['colorsWrapper']">
        <view
          v-for="item in siblingProducts" :key="item.id"
          :class="{[$style['colorItem']]: true, 'is-selected': product.name === item.name}"
          @tap="goToProduct(item.name)"
        >
          <view v-if="!!colorOptionImages[item.colorValue]" :class="$style['colorItemImage']">
            <image
              :src="optimizeImage(colorOptionImages[item.colorValue])"
              :class="$style['image']" mode="aspectFill"
            ></image>
          </view>
          <view v-else :class="$style['colorItemText']">{{ item.colorValue }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'

export default {
  name: 'JoyberryProductSingleColors',
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
      type: Object,
      required: true
    },
  },
  data() {
    return {
      pending: false,
      siblingProducts: [],
      colorOptionImages: {}, // { optionValue: imageSrc, ... }
    }
  },
  computed: {
    ...mapState('theme', ['themeSettingsData']),
  },
  created() {
    this.configColorOptions()
    this.fetchColors()
  },
  methods: {
    optimizeImage,
    async fetchColors() {
      this.pending = true
      const namePrefix = this.product.name.split('--')[0]
      // console.log(namePrefix)
      try {
        const res = await API.get('/shopfront/product/', {
          params: {
            fields: ['id', 'name', 'title', 'tags'].join(','),
            name__startswith: namePrefix,
            order_by: 'name',
          }
        })
        this.siblingProducts = _.map(res.data.results, (item) => {
          const { id, name, title, tags } = item
          const colorTag = _.find(tags, (tag) => tag.substr(0, 3) === '颜色:')
          const colorValue = colorTag ? colorTag.substr(3) : ''
          return { id, name, title, colorValue }
        })
        // console.log(this.siblingProducts)
      } catch(err) {
        console.log(err)
      }
      this.pending = false
    },
    // valueHasImage(value) {
    //   return !!this.colorOptionImages[value]
    // },
    configColorOptions() {
      const colorOptionImages = _.get(this.themeSettingsData, 'colorOptionImages') || []
      this.colorOptionImages = _.fromPairs(_.map(colorOptionImages, (image) => {
        return [_.get(image, 'metafield.altText') || '', image]
      }))
      // console.log(this.colorOptionImages)
    },
    goToProduct(productName) {
      Taro.redirectTo({ url: `/pages/product/index?name=${productName}` })
    },
  },
  watch: {
    'themeSettingsData': {
      handler(newValue) {
        this.configColorOptions()
      },
      deep: true,
    },
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.section {
  width: 100%;
  overflow: hidden;
  padding: 10px 15px 5px;
}
.sectionTitle {
  font-size: 13px;
  font-weight: bold;
}
.colorsWrapper {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.colorItem {
  margin-right: 8px;
  margin-top: 8px;
  .colorItemImage {
    height: 28px;
    width: 28px;
    overflow: hidden;
    border: 2px solid transparent;
    .image {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  &:global(.is-selected) .colorItemImage {
    border-color: $color-text;
  }
  .colorItemText {
    font-size: 12px;
    min-width: 60px;
    text-align: center;
    padding: 2px 10px;
    line-height: 20px;
    border-radius: 15px;
    border: 2px solid transparent;
    color: $color-text;
    background-color: $color-bg-gray;
  }
  &:global(.is-selected) .colorItemText {
    border-color: $color-text;
    background-color: #fff;
  }
}
</style>
