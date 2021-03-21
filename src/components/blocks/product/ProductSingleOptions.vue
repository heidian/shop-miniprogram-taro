<template>
  <view :style="css">
    <view :class="$style['section']" v-if="optionsLayout === 'drawer'">
      <view :class="$style['cell']" @tap="() => variantsDrawerVisible = true">
        <view :class="$style['cellLabel']">已选</view>
        <view :class="$style['cellValue']">{{ currentVariant.title }}</view>
        <view :class="$style['cellFt']">
          <image :class="$style['cellFtIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
        </view>
      </view>
    </view>
    <view :class="$style['section']" v-if="optionsLayout === 'tiled'">
      <view :class="$style['optionsWrapper']">
        <view v-for="option in options" :key="`${product.id}-${option.title}`" :class="$style['optionGroup']">
          <view :class="$style['optionTitle']">{{ option.title }}</view>
          <view :class="$style['optionValues']">
            <view
              v-for="item in option.items" :key="`${product.id}-${item.value}`"
              :class="{
                [$style['optionLabel']]: true,
                [$style['optionLabelImage']]: !!item.image,
                'is-selected': item.selected,
                'is-disabled': item.disabled,
              }"
              :style="item.image ? {
                'backgroundImage': backgroundImageUrl(item.image)
              } : {}"
              @tap="() => onClickOptionValue(option.title, item.value)"
            >{{item.value}}</view>
          </view>
        </view>
      </view>
    </view>

    <select-variant
      :visible.sync="variantsDrawerVisible"
      openType=""
      :product="product"
      :variant="currentVariant"
      @selectVariant="onSelectVariant"
    ></select-variant>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import SelectVariant from '@/components/SelectVariant/SelectVariant'
import Price from '@/components/Price'

export default {
  name: 'ProductSingleOptions',
  components: {
    SelectVariant,
    Price,
  },
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        optionsLayout: 'drawer'  // drawer|tiled
      })
    },
    product: {
      type: Object,
      required: true,
    },
    variant: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      variantsDrawerVisible: false,
      currentVariant: this.variant,
      options: [],
    }
  },
  computed: {
    optionsLayout() {
      if (_.isEmpty(this.product.options)) {
        return ''
      } else if (this.settingsData.optionsLayout === 'tiled') {
        return 'tiled'
      } else {
        return 'drawer'
      }
    }
  },
  mounted() {
    this.options = this.formatOptions()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    onSelectVariant(variantId, quantity) {
      if (variantId && variantId !== this.currentVariant.id) {
        this.currentVariant = _.find(this.product.variants || [], { id: variantId })
        this.$emit('update:variant', this.currentVariant)
      }
    },
    formatOptions() {
      const colorOptionTitle = _.get(this.$store.state.theme, 'themeSettingsData.colorOptionTitle.value') || ''
      const colorOptionImages = _.get(this.$store.state.theme, 'themeSettingsData.colorOptionImages') || []
      const results = _.map(this.product.options, (option) => {
        const title = option.title
        const items = _.map(option.values, (value) => {
          const result = {
            value: value,
            disabled: false,
            selected: value === _.get(_.find(this.currentVariant.options, { title }), 'value')
          }
          if (title === colorOptionTitle) {
            const colorImageItem = _.find(colorOptionImages, (item) => _.get(item, 'metafield.altText') === value)
            if (colorImageItem) {
              result['image'] = { 'src': colorImageItem.src }
            }
          }
          return result
        })
        return { title, items }
      })
      return results
    },
    onClickOptionValue(title, value) {
      const options = _.cloneDeep(this.options)
      const selectResult = {}
      _.forEach(options, (option) => {
        _.forEach(option.items, (item) => {
          if (option.title === title) {
            item.selected = (item.value === value) ? !item.selected : false
          }
          if (item.selected) {
            selectResult[option.title] = item.value
          }
          if (option.title !== title) {
            // 不是当前选择的那一项, 需要处理下 disable
          }
        })
      })
      const currentVariant = _.find(this.product.variants, (variant) => {
        return _.every(variant.options, (option) => selectResult[option.title] === option.value)
      })
      if (currentVariant) {
        this.onSelectVariant(currentVariant.id)
      }
      this.options = options
    },
  },
  watch: {
    variant(newValue) {
      this.currentVariant = newValue
      this.options = this.formatOptions()
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
/* options select */
.cell {
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  & + & {
    border-top: 1px solid #f6f6f6;
  }
}
.cellLabel {
  margin-right: 20px;
}
.cellValue {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cellFt {
  margin-left: 20px;
}
.cellFtIcon {
  width: 10px;
  height: 12px;
}

/* options */
.optionsWrapper {
  width: 100%;
  overflow: hidden;
  padding: 5px 15px;
}
.optionGroup {
  margin: 10px auto;
}
.optionTitle {
  font-size: 13px;
  margin-bottom: 10px;
  font-weight: bold;
}
.optionValues {
  // width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
}
.optionLabel {
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
  min-width: 60px;
  text-align: center;
  padding: 2px 10px;
  line-height: 20px;
  border-radius: 15px;
  border: 2px solid transparent;
  color: $color-text;
  background-color: $color-bg-gray;
  &:global(.is-selected) {
    border-color: $color-text;
    background-color: #fff;
  }
  &:global(.is-disabled) {
    color: $color-text-light;
  }
  &.optionLabelImage {
    color: transparent;
    height: 28px;  // 20 + (2 + 2) * 2
    width: 28px;  // 20 + (2 + 2) * 2
    margin-left: 1px;
    margin-top: 1px;
    min-width: 0;
    overflow: hidden;
    border-radius: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    &:global(.is-selected) {
      border-color: transparent;
      box-shadow: 0 0 0 1px $color-text-light;
    }
  }
}
</style>
