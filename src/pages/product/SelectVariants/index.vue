<template>
  <view class="drawer" :class="{'opened': !!drawerOpenedType}">
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
      <view class="drawer__footer">
        <button v-if="drawerOpenedType == 'add_to_cart'" class="drawer__btn btn--blue" @tap="onClickAddToCart"><text class="drawer__btn__text">加入购物车</text></button>
        <button v-if="drawerOpenedType == 'buy_now'" class="drawer__btn btn--orange" @tap="onClickBuyNow"><text class="drawer__btn__text">立即购买</text></button>
      </view>
    </view>
  </view>
</template>
<script>
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import './index.scss'

export default {
  name: 'SelectVariant',
  props: {
    drawerOpenedType: {
      type: String,
      default: () => {
        return ''
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
    onClickAddToCart () {
      if (!this.quantity || !this.currentVariant || !this.currentVariant.id) {
        Taro.showModal({
          title: '下单失败',
          content: '商品规格或者库存有误，请稍后重试',
          showCancel: false
        })
        return
      }
      const lines = [{
        quantity: this.quantity,
        variant_id: this.currentVariant.id
      }]
      this.$store.dispatch('cart/add', {
        variantId: this.currentVariant.id,
        quantity: this.quantity || 1,
        attributes: {}
      }).then(() => {
        Taro.vibrateShort()
        this.onToggleDrawer()
      }).catch(err => {
        API.handlerErr(err)
      })
    },
    onClickBuyNow () {
      if (!this.quantity || !this.currentVariant || !this.currentVariant.id) {
        Taro.showModal({
          title: '下单失败',
          content: '商品规格或者库存有误，请稍后重试',
          showCancel: false
        })
        return
      }
      const lines = [{
        quantity: this.quantity,
        variant_id: this.currentVariant.id
      }]
      Taro.showLoading({ title: '正在下单中' })
      setTimeout(() => {
        Taro.hideLoading()
      }, 10000)
      API.post('/checkout/', { source_name: 'miniprogram', lines: lines }, {
        headers: {
          accept: 'application/json;version=2.0'
        }
      }).then(res => {
        const token = res.data.token
        setTimeout(() => {
          Taro.navigateTo({
            url: `/pages/checkout/index?token=${token}`
          })
          Taro.hideLoading()
        }, 200);
      }).catch(err => {
        handleErr(err)
      })
    },
    onInputQuantity (e) {
      const value = e.detail.value
      if (value > this.maxInventoryQuantity) {
        Taro.showToast({
          title: "超过最大库存",
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
      let res = _.filter(this.allOptionPairs, this.selectedOptions)
      // res = _.map(res, item => _.omit(item, _.keys(this.selectedOptions)))
      res = _.reduce(res, (result, item) => {
        _.forEach(item, (value, key) => {
          if (!result.hasOwnProperty(key)) result[key] = [];
          result[key].push(value)
        })
        return result
      }, {})
      // chain 在 lodash plugin 里不能用, chain 一定要引入完整的 lodash 才能使用
      // const res = _.chain(this.allOptionPairs || [])
      //              .filter(this.selectedOptions || {})
      //              // .map(item => _.omit(item, _.keys(this.selectedOptions)))
      //              .reduce((result, item) => {
      //                _.forEach(item, (value, key) => {
      //                  if (!result.hasOwnProperty(key)) result[key] = [];
      //                  result[key].push(value)
      //                })
      //                return result
      //              }, {})
      //              .value()
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
      this.$emit('onToggleDrawer', '')
    },
  },
}
</script>
<style lang="scss"></style>
