<template>
  <view class="drawer" :class="{'opened': drawerOpened}">
    <view class="drawer__mask"
      @tap="onToggleDrawer">
      </view>
    <view class="drawer__content select-variant">
      <view class="drawer__header">
        <image class="drawer__variant__image" :src="currentVariant.image|imageUrl(200)" mode="aspectFill"></image>
        <view class="drawer__variant__caption">
          <view class="drawer__variant__price">{{ currentVariant.price|currency }}</view>
          <view class="drawer__variant__title">已选择{{ currentVariant.title }}</view>
        </view>
      </view>
      <view class="drawer__body">
        <view v-for="option in hydratedOptions" :key="option.id" class="drawer__option">
          <view class="drawer__option__title">{{ option.title }}</view>
          <radio-group class="drawer__option__values">
            <label v-for="item in option.hydratedValues" :key="item.value"
              class="drawer__option__label"
              @tap="() => onClickOptionValue(item, option.title)">
              <radio :value="item.value" :checked="item.checked" :disabled="item.disabled" class="drawer__option__ratio"/>
              <view class="drawer__option__fake-radio" :class="{checked: item.checked, disabled: item.disabled}">{{item.value}}</view>
            </label>
          </radio-group>
        </view>
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
      <view class="drawer__footer"></view>
    </view>
  </view>
</template>
<script>
import Taro from '@tarojs/taro'
export default {
  name: 'SelectVariant',
  props: {
    drawerOpened: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    product: {
      type: Object,
      default: () => {
        return {}
      }
    },
    currentVariant: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      selectedOptions: {
        /*
        ** 数据结构为 { "color": "Red" }
        */
      },
      availableOptions: [],
      maxInventoryQuantity: 1,
      quantity: 1,
    }
  },
  computed: {
    variantsOptionPairs () {
      /*  返回的数据结构如下
      ** [
      **   { variantId: 123, options: {"color": "Red", "size": "S"} },
      **   { variandId: 234, options: {"color": "Red", "size": "L"} },
      **   { variandId: 345, options: {"color": "Blue", "size": "S"} },
      **   { variandId: 456, options: {"color": "Blue", "size": "M"} },
      ** ]
      */
      return _.map(this.product.variants || [], variant => {
        const res = {}
        _.forEach(variant.options, option => {
          res[option.title] = option.value
        })
        return {
          variantId: variant.id,
          options: res
        }
      })
    },
    allOptionPairs () {
      /*  返回的数据结构如下
      ** [
      **   {"color": "Red", "size": "S"},
      **   {"color": "Red", "size": "L"},
      **   {"color": "Blue", "size": "S"},
      **   {"color": "Blue", "size": "M"},
      ** ]
      */
      return _.map(this.variantsOptionPairs || [], 'options')
    },
    hydratedOptions () {
      return _.map(_.get(this.product || {}, 'options', []), option => {
        return {
          ...option,
          hydratedValues: _.map(option.values || [], value => {
            return {
              checked: value === this.selectedOptions[option.title],
              disabled: !_.includes(this.availableOptions[option.title], value),
              value
            }
          })
        }
      })
    }
  },
  watch: {
    selectedOptions: {
      // 监听选择的 option，更新其他可用的option状态（disabled, checked）
      deep: true,
      handler (newVal) {
        this.updateAvailableOptions()
        const selectedVariant = _.find(this.variantsOptionPairs || [], variantData => {
          return _.isEqual(variantData.options, this.selectedOptions)
        })
        !!selectedVariant && this.$emit('onSelectVariant', selectedVariant.variantId)
      }
    },
    currentVariant (newVal) {
      if (_.isEmpty(newVal)) return
      const { options = [], inventory_policy, inventory_quantity, is_available } = newVal || {}
      const selectedOptions = {}
      _.forEach(options, (option) => {
        selectedOptions[option.title] = option.value
      })
      this.selectedOptions = selectedOptions
      this.maxInventoryQuantity = inventory_policy === 'continue' ? 9999 : inventory_quantity
      this.quantity = Math.min(this.maxInventoryQuantity, this.quantity)
    }
  },
  methods: {
    onInputQuantity (e) {
      const value = e.detail.value
      if (value > this.maxInventoryQuantity) {
        Taro.showToast({
          title: "超过最大库存提",
          icon: "none"
        })
        _.delay(() => {
          this.quantity = Math.min(this.maxInventoryQuantity, value)
        }, 1500)
      } else {
        this.quantity = value
      }
    },
    onChangeQuantity (value) {
      this.quantity = (this.quantity || 0) + value
    },
    updateAvailableOptions () {
      const res = _.chain(this.allOptionPairs || [])
              .filter(this.selectedOptions || {})
              // .map(item => _.omit(item, _.keys(this.selectedOptions)))
              .reduce((result, item) => {
                _.forEach(item, (value, key) => {
                  if (!result.hasOwnProperty(key)) result[key] = [];
                  result[key].push(value)
                })
                return result
              }, {})
              .value()
      this.availableOptions = res
    },
    onClickOptionValue (item, optionTitle) {
      const { checked, disabled, value } = item || {}
      if (disabled) return
      if (!checked) {
        this.selectedOptions = {
          ...this.selectedOptions,
          [optionTitle]: value
        }
      } else {
        this.selectedOptions = _.omit(this.selectedOptions, [optionTitle])
        // delete this.selectedOptions[optionTitle]  // 此处不用 delete 方法，因为删除对象的键值不会触发 watch
      }
    },
    onToggleDrawer () {
      this.$emit('onToggleDrawer', false)
    },
  },
}
</script>
<style lang="scss">
$color-highlight: #e74c3c;
$color-border: #ecf0f1;

.drawer {
  &__mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: none;
    z-index: 110;
  }
  &__content {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 800px;
    overflow: hidden;
    background-color: #ffffff;
    z-index: 120;
    padding: 220px 20px 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    transform: translate3d(0, 100%, 0);
    transition: transform .25s ease-in-out;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }
  &__header {
    position: absolute;
    left: 0;
    top: 0;
    height: 220px;
    width: 100%;
    padding: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    // box-shadow: 0 0 0 2px $color-border;
  }
  &__variant__image {
    width: 180px;
    height: 180px;
    border-radius: 8px;
    margin-right: 20px;
  }
  &__variant__caption {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  &__variant__price {
    color: $color-highlight;
    font-size: 36px;
    font-weight: bold;
    line-height: 1.6;
  }
  &__variant__title {
    font-size: 24px;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__footer {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 80px;
    width: 100%;
    background-color: rgb(0, 194, 58);
  }
  &__body {
    width: 100%;
    flex: 1;
    overflow: auto;
    padding-top: 20px;
  }
  &.opened &__mask {
    display: block;
  }
  &.opened &__content {
    transform: translate3d(0, 0, 0);
  }

  /* options */
  &__option {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  &__option--row {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  &__option--row &__option__title {
    margin-bottom: 0;
  }
  &__option + &__option {
    margin-top: 30px;
  }
  &__option__title {
    font-size: 26px;
    margin-bottom: 20px;
    font-weight: bold;
  }
  &__option__values {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    align-items: center;
  }
  &__option__label {
    margin: 0 20px 20px 0;
  }
  &__option__ratio {
    display: none;
  }
  &__option__fake-radio {
    min-width: 80px;
    text-align: center;
    font-size: 24px;
    line-height: 28px;
    padding: 10px 18px;
    background-color: transparent;
    border: 2px solid $color-border;
    border-radius: 24px;
  }
  &__option__fake-radio.disabled {
    background-color: #f0f0f0;
    color: #777777;
  }
  &__option__fake-radio.checked {
    background-color: $color-highlight;
    color: #ffffff;
    border-color: $color-highlight;
  }

  &__adjust-qty {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  &__adjust-qty__btn {
    padding: 0;
    margin: 0;
    width: 60px;
    height: 52px;
    text-align: center;
    border: none;
    position: relative;
    background-color: transparent;
  }
  &__adjust-qty__btn::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 30px;
    margin-left: -15px;
    margin-top: -15px;
    background-color: #f0f0f0;
    border-radius: 50%;
  }
  &__adjust-qty__btn__text {
    position: absolute;
    top: 0;
    left: 50%;
    margin-left: -12px;
    line-height: 52px;
    font-size: 24px;
    width: 24px;
    text-align: center;
  }
  &__adjust-qty__btn::after {
    display: none;
  }
  &__adjust-qty__input {
    max-width: 60px;
    min-width: 28px;
    text-align: center;
    font-size: 24px;
    border: none;
    outline: none;
  }
}
</style>

