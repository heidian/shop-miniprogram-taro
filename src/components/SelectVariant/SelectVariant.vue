<template>
  <drawer-bottom
    :visible="isVisible" @close="onClose" @open="onOpen"
    header="选择" :class="$style['drawerVariants']"
  >
    <view :class="$style['header']">
      <image :class="$style['variantImage']" :src="selectedVariant.image|imageUrl(200)" mode="aspectFill"></image>
      <view :class="$style['headerCaption']">
        <view :class="$style['variantPrice']">{{ selectedVariant.price|currency }}</view>
        <view :class="$style['variantTitle']">已选择 {{ selectedVariant.title }}</view>
      </view>
    </view>
    <view :class="$style['options']">
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
    <view>
      <view class="drawer__option drawer__option--row">
        <view class="drawer__option__title">数量</view>
        <view class="drawer__adjust-qty">
          <button :disabled="quantity <= 1"
            class="drawer__adjust-qty__btn drawer__adjust-qty__minus"
            @tap="onChangeQuantity(-1)">
            <text class="drawer__adjust-qty__btn__text">-</text>
          </button>
          <input
            type="number"
            class="drawer__adjust-qty__input"
            :value="quantity"
            :maxValue="maxInventoryQuantity"
            @input="onInputQuantity"/>
          <button :disabled="quantity >= maxInventoryQuantity"
            class="drawer__adjust-qty__btn drawer__adjust-qty__add"
            @tap="onChangeQuantity(1)">
            <text class="drawer__adjust-qty__btn__text">+</text>
          </button>
        </view>
      </view>
    </view>
    <view class="drawer__footer1">
      <button v-if="openType == 'add_to_cart'" class="drawer__btn btn--blue" @tap="onClickAddToCart"><text class="drawer__btn__text">加入购物车</text></button>
      <button v-if="openType == 'buy_now'" class="drawer__btn btn--orange" @tap="onClickBuyNow"><text class="drawer__btn__text">立即购买</text></button>
    </view>
  </drawer-bottom>
</template>
<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import DrawerBottom from '@/components/DrawerBottom/'

export default {
  name: 'SelectVariant',
  components: {
    DrawerBottom
  },
  props: {
    // 通过 props 里的 visible 来控制 open 和 close, 首次 mounted 的时候就是 visible 也会触发 open 事件
    visible: {
      type: Boolean,
      default: false
    },
    openType: {
      type: String,
      default: ''
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
      maxInventoryQuantity: 1000,
      quantity: 1,
    }
  },
  computed: {},
  methods: {
    onClose() {
      this.$emit('selectVariant', this.selectedVariant.id)
      this.$emit('close')
    },
    onOpen() {
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
      //
    },
    onChangeQuantity(value) {
      this.quantity = (this.quantity || 0) + (+value)
    },
    onInputQuantity() {
      //
    },
    onClickAddToCart() {
      //
    },
    onClickBuyNow() {
      //
    },
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
