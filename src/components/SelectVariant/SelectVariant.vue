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
          <view
            v-for="item in option.items" :key="item.value"
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
    <view :class="$style['quantityWrapper']">
      <view>数量</view>
      <input-number :class="$style['quantityInput']" :min="1" v-model="quantity"></input-number>
    </view>
    <view :class="{[$style['buttonsWrapper']]: true, [$style['isLikeIphoneX']]: isLikeIphoneX}">
      <button v-if="openType !== 'buy_now'"
        :class="['button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
        @tap="onClickAddToCart"
      >加入购物车</button>
      <button v-if="openType !== 'add_to_cart'"
        :class="['button', 'button--primary', 'button--small', 'button--round']"
        @tap="onClickBuyNow"
      >立即购买</button>
    </view>
  </drawer-bottom>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { mapState, mapGetters } from 'vuex'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'
import InputNumber from '@/components/InputNumber'
import DrawerBottom from '@/components/DrawerBottom'

export default {
  name: 'SelectVariant',
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
      quantity: 1,
      pending: true
    }
  },
  computed: {
    ...mapGetters('system', ['isLikeIphoneX'])
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    onDrawerClose() {
      this.isVisible = false
      if (this.selectedVariant.id) {
        this.$emit('selectVariant', this.selectedVariant.id)
      }
      this.$emit('close')
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
            selected: value === _.get(_.find(this.selectedVariant.options, { title }), 'value')
          }
          if (title === colorOptionTitle) {
            const colorImageItem = _.find(colorOptionImages, (item) => _.get(item, 'name.value') === value)
            if (colorImageItem) {
              result['image'] = colorImageItem.image
            }
          }
          return result
        })
        return { title, items }
      })
      return results
    },
    onDrawerOpen() {
      this.isVisible = true
      this.selectedVariant = { ...this.variant }
      this.variants = _.map(this.product.variants, variant => ({ ...variant }))
      this.options = this.formatOptions()
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
    onClickAddToCart() {
      if (!this.selectedVariant.id) {
        Taro.showModal({
          title: '加入购物车失败',
          content: '请先选择商品规格',
          showCancel: false
        })
        return
      }
      this.$store.dispatch('cart/add', {
        variantId: this.selectedVariant.id,
        quantity: this.quantity,
        attributes: {}
      }).then(() => {
        Taro.vibrateShort()
        Taro.showToast({ title: '成功加入购物车', icon: 'none', duration: 1000 })
        this.isVisible = false  // 这个执行了以后自动会调用 onDrawerClose
      }).catch(handleErr)
    },
    onClickBuyNow() {
      if (!this.selectedVariant.id) {
        Taro.showModal({
          title: '购买失败',
          content: '请先选择商品规格',
          showCancel: false
        })
        return
      }
      Taro.showLoading({ title: '正在下单中' })
      this.$store.dispatch('checkout/create', {
        lines: [{
          quantity: this.quantity,
          variant_id: this.selectedVariant.id
        }]
      }).then(({ token }) => {
        Taro.hideLoading()
        Taro.navigateTo({ url: `/pages/checkout/index?token=${token}` })
      }).catch((err) => {
        Taro.hideLoading()
        handleErr(err)
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
