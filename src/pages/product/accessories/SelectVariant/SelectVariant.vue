<template>
  <drawer-bottom
    :visible="isVisible" @close="onDrawerClose" @open="onDrawerOpen"
    header="选择" :class="$style['drawerBody']"
  >
    <view :class="$style['header']">
      <image :class="$style['variantImage']" :src="selectedVariant.image|imageUrl(200)" mode="aspectFill" @tap="onPreviewImage"></image>
      <view :class="$style['headerCaption']">
        <price
          :class="$style['variantPrice']" :highlight="true" :keepZero="true"
          :price="selectedVariant.price" :compareAtPrice="selectedVariant.compare_at_price"
        ></price>
        <view :class="$style['variantTitle']">已选择: {{ selectedVariant.title }}</view>
      </view>
    </view>
    <view :class="$style['optionsWrapper']">
      <view v-for="option in options" :key="option.title" :class="$style['optionGroup']">
        <view :class="$style['optionTitle']">{{ option.title }}</view>
        <view :class="$style['optionValues']">
          <view v-for="item in option.items" :key="item.value"
            :class="{[$style['optionLabel']]: true, 'is-selected': item.selected, 'is-disabled': item.disabled}"
            @tap="() => onClickOptionValue(option.title, item.value)"
          >{{item.value}}</view>
        </view>
      </view>
    </view>
    <view :class="$style['quantityWrapper']">
      <view>数量</view>
      <input-number :class="$style['quantityInput']" :min="1" v-model="quantity"></input-number>
    </view>
    <view :class="{[$style['buttonsWrapper']]: true, [$style['isLikeIphoneX']]: isLikeIphoneX}">
      <button
        :class="['button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
        :disabled="!selectedVariant || !selectedVariant.is_available"
        @tap="onConfirm"
      >{{ selectedVariant && selectedVariant.is_available ? '确定' : '缺货' }}</button>
    </view>
  </drawer-bottom>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { mapState, mapGetters } from 'vuex'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import Price from '@/components/Price'
import InputNumber from '@/components/InputNumber'
import DrawerBottom from '@/components/DrawerBottom'

export default {
  name: 'AccessoriesSelectVariant',
  components: {
    DrawerBottom,
    Price,
    InputNumber
  },
  props: {
    // 通过 props 里的 visible 来控制 open 和 close, 首次 mounted 的时候就是 visible 也会触发 open 事件
    visible: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: () => {
        return {}
      }
    },
    variant: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      isVisible: !!this.visible,
      variants: [],
      options: [],
      selectedVariant: {},
      quantity: 1,
      pending: true
    }
  },
  computed: {
    ...mapGetters('system', ['isLikeIphoneX'])
  },
  methods: {
    onDrawerClose() {
      this.isVisible = false
      // if (this.selectedVariant.id) {
      //   this.$emit('selectVariant', this.selectedVariant.id)
      // }
      this.$emit('close')
    },
    onDrawerOpen() {
      this.isVisible = true
      this.selectedVariant = { ...this.variant }
      this.variants = _.map(this.product.variants, variant => ({ ...variant }))
      this.options = _.map(this.product.options, (option) => {
        const title = option.title
        const items = _.map(option.values, value => {
          return {
            value: value,
            disabled: false,
            selected: value === _.get(_.find(this.selectedVariant.options, { title }), 'value')
          }
        })
        return { title, items }
      })
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
      const selectedVariant = _.find(this.variants, (variant) => {
        return _.every(variant.options, (option) => selectResult[option.title] === option.value)
      })
      this.selectedVariant = selectedVariant || {}
      this.options = { ...options }
    },
    onConfirm () {
      this.$emit('confirm', {
        productId: this.product.id,
        variant: this.selectedVariant,
        quantity: this.quantity,
      })
    },
    onPreviewImage () {
      const url = _.get(this.selectedVariant, 'image.src')
      if (url) {
        Taro.previewImage({
          curent: url,
          urls: [url]
        })
      }
    }
  },
  watch: {
    visible(newValue) {
      this.isVisible = !!newValue
    }
  }
}
</script>

<style lang="scss" module>
@import './SelectVariant.scss'
</style>
