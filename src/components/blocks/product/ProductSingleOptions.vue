<template>
  <view :style="css">
    <view v-if="optionsLayout === 'drawer'" :class="$style['cell']" @tap="() => variantsDrawerVisible = true">
      <view :class="$style['cellLabel']">已选</view>
      <view :class="$style['cellValue']">{{ currentVariant.title }}</view>
      <view :class="$style['cellFt']">
        <image :class="$style['cellFtIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
      </view>
    </view>
    <view v-if="optionsLayout === 'tiled'" :class="$style['optionsWrapper']">
      <view v-for="{ title, values } in product.options" :key="`${product.id}-${title}`" :class="$style['optionGroup']">
        <view :class="$style['optionTitle']">
          <text>{{ title }}</text>
          <text
            v-if="title === colorOptionTitle" :class="$style['optionTitleAppend']"
          >{{ selected[title] }}</text>
        </view>
        <view :class="$style['optionValues']">
          <view
            v-for="value in values" :key="`${product.id}-${value}`"
            :class="{
              [valueHasImage(title, value) ? $style['optionLabelImage'] : $style['optionLabelText']]: true,
              'is-selected': selected[title] === value,
              'is-disabled': disabled[title] && !!disabled[title][value],
            }"
            @tap="() => onClickOptionValue(title, value)"
          >
            <image
              v-if="valueHasImage(title, value)"
              :src="optimizeImage(colorOptionImages[value])"
              :class="$style['image']" mode="aspectFill"
            ></image>
            <template v-else>{{ value }}</template>
          </view>
        </view>
        <!-- /optionValues -->
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
import { mapState } from 'vuex'
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
      colorOptionTitle: '',
      colorOptionImages: {}, // { optionValue: imageSrc, ... }

      currentVariant: this.variant,
      selected: {},  // 当前完整的选项 { [title]:value, ... }
      disabled: {},  // 当前禁用的条目 { [title]: { [value]: true, ... }, ... }
      lastSelection: {},  // 上一次的选项 { [title]: value }
    }
  },
  created() {
    this.configColorOptions()
    this.calcSelectedAndDisabled()
    this.lastSelection = {}
  },
  computed: {
    ...mapState('theme', ['themeSettingsData']),
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
  methods: {
    optimizeImage,
    backgroundImageUrl,
    valueHasImage(title, value) {
      return title === this.colorOptionTitle && !!this.colorOptionImages[value]
    },
    configColorOptions() {
      this.colorOptionTitle = _.get(this.themeSettingsData, 'colorOptionTitle.value') || ''
      const colorOptionImages = _.get(this.themeSettingsData, 'colorOptionImages') || []
      this.colorOptionImages = _.fromPairs(_.map(colorOptionImages, (image) => {
        return [_.get(image, 'metafield.altText') || '', image]
      }))
    },
    calcSelectedAndDisabled() {
      const variants = this.pairVariantOptions()  // variants 转化成 { id, [title]: [value], ... } 的形式
      const _selected = _.find(variants, { id: this.currentVariant.id })
      this.selected = _.omit(_selected, ['id'])
      const disabled = {}  // { [title]: { [value]: true|false } }
      _.forEach(this.product.options, ({ title, values }) => {
        const disabledValues = {}
        _.forEach(values, (value) => {
          const disabled = !_.find(variants, { ...this.lastSelection, [title]: value })
          // disabled 是根据当前选择的条目进行排除
          disabledValues[value] = disabled
        })
        disabled[title] = disabledValues
      })
      this.disabled = disabled
    },
    onClickOptionValue(selectedTitle, selectedValue) {
      const variants = this.pairVariantOptions()  // variants 转化成 { id, [title]: [value], ... } 的形式
      const frozen = { [selectedTitle]: selectedValue }
      while (true) {
        // 循环寻找没有被放进 frozen 里面的 option
        const option = _.find(this.product.options, (option) => typeof frozen[option.title] === 'undefined')
        if (!option) {
          break
        }
        const variant = _.find(variants, {
          ...frozen,
          [option.title]: this.selected[option.title]
        })  // 判断在 frozen 条件下, 当前 option 的选项是否有对应的 variant
        if (!variant) {
          const fallbackVariant = _.find(variants, { ...frozen })  // 找到第一个满足 frozen 条件的 variant
          frozen[option.title] = fallbackVariant[option.title]
        } else {
          frozen[option.title] = this.selected[option.title]
        }
      }
      this.lastSelection = { [selectedTitle]: selectedValue }
      const frozenVariant = _.find(variants, { ...frozen })  // 一定存在
      this.onSelectVariant(frozenVariant.id)
      // 上面这个会触发一次 variant 的 watch 导致重新执行 calcSelectedAndDisabled, 然后会更新 selected 和 disabled
    },
    pairVariantOptions() {
      // variants 转化成 { id, [title]: [value], ... } 的形式
      return _.map(this.product.variants, (variant) => {
        const data = { id: variant.id }
        _.forEach(variant.options, ({ title, value }) => data[title] = value)
        return data
      })
    },
    onSelectVariant(variantId, quantity) {
      if (variantId && variantId !== this.currentVariant.id) {
        this.currentVariant = _.find(this.product.variants || [], { id: variantId })
        this.$emit('update:variant', this.currentVariant)
      }
    },
  },
  watch: {
    'themeSettingsData': {
      handler(newValue) {
        this.configColorOptions()
      },
      deep: true,
    },
    variant(newValue) {
      this.currentVariant = newValue
      this.calcSelectedAndDisabled()
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
  .optionTitleAppend {
    font-weight: normal;
    margin-left: 0.5em;
    font-size: 0.9em;
    color: $color-text-light;
  }
}
.optionValues {
  // width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
}
.optionLabelText {
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
}
.optionLabelImage {
  height: 28px;  // 20 + (2 + 2) * 2
  width: 28px;  // 20 + (2 + 2) * 2
  margin-right: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  &:global(.is-selected) {
    border-color: $color-text;
  }
  .image {
    display: block;
    width: 100%;
    height: 100%;
  }
}
.optionLabelText,
.optionLabelImage {
  position: relative;
  &:global(.is-disabled) {
    // color: $color-text-light;
    opacity: 0.5;
  }
}
</style>
