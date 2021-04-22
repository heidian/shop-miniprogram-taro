<template>
  <drawer
    :visible.sync="isVisible" @close="onDrawerClose" @open="onDrawerOpen"
    position="bottom" header="选择" :class="$style['drawerBody']"
  >
    <view :class="$style['header']">
      <image :class="$style['variantImage']" :src="currentVariant.image|imageUrl(200)" mode="aspectFill" @tap="onPreviewImage"></image>
      <view :class="$style['headerCaption']">
        <price
          :class="$style['variantPrice']" :highlight="true" :keepZero="true"
          :price="currentVariant.price" :compareAtPrice="currentVariant.compare_at_price"
        ></price>
        <view :class="$style['variantTitle']">已选择: {{ currentVariant.title }}</view>
      </view>
    </view>
    <view :class="$style['optionsWrapper']">
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
    <!-- 不然会在页面上出现一个很诡异的浮动的内容为 "1" 的输入框 -->
    <view :class="$style['quantityWrapper']" v-if="isVisible">
      <view>数量</view>
      <input-number :class="$style['quantityInput']" :min="1" v-model="quantity"></input-number>
    </view>
    <view :class="$style['buttonsWrapper']">
      <button v-if="!openType"
        :class="['button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
        @tap="isVisible = false"
      >确定</button>
      <button v-else-if="inventoryDeny"
        :class="['button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
        disabled
      >库存不足</button>
      <button v-else-if="openType === 'add_to_cart'"
        :class="['button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
        @tap="onClickAddToCart"
      >加入购物车</button>
      <button v-else-if="openType === 'buy_now'"
        :class="['button', 'button--primary', 'button--small', 'button--round']"
        @tap="onClickBuyNow"
      >立即购买</button>
    </view>
  </drawer>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'
import InputNumber from '@/components/InputNumber'
import Drawer from '@/components/Drawer'

export default {
  name: 'SelectVariant',
  components: {
    Drawer,
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
      colorOptionTitle: '',
      colorOptionImages: {}, // { optionValue: imageSrc, ... }

      quantity: 1,
      currentVariant: {},
      selected: {},  // 当前完整的选项 { [title]:value, ... }
      disabled: {},  // 当前禁用的条目 { [title]: { [value]: true, ... }, ... }
      lastSelection: {},  // 上一次的选项 { [title]: value }
    }
  },
  computed: {
    ...mapState('theme', ['themeSettingsData']),
    inventoryDeny() {
      return this.currentVariant.inventory_policy === 'deny' &&
        (+this.currentVariant.inventory_quantity) < (+this.quantity)
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    // resetData() {
    //   this.quantity = 1
    //   this.currentVariant = {}
    //   this.options = []
    // },
    initializeOnOpen() {
      this.quantity = 1
      this.currentVariant = this.variant
      this.configColorOptions()
      this.calcSelectedAndDisabled()
      this.lastSelection = {}
    },
    onDrawerClose() {
      this.$emit('update:visible', false)
      if (this.currentVariant.id) {
        this.$emit('selectVariant', this.currentVariant.id, this.quantity)
      }
      this.$emit('close')
      // 这里暂时先注释，不采用reset的方式，而是采用更新模版里列表渲染的key，来保证传入不同product 和 variant的时候，option渲染也会强制更新
      // this.resetData()
    },
    onDrawerOpen() {
      this.$emit('update:visible', true)
      // 打开 drawer 的时候处理初始值, 就不需要 watch 除了 visible 以外其他 props 的变化了
      this.initializeOnOpen()
    },
    valueHasImage(option, item) {
      return option.title === this.colorOptionTitle && !!this.colorOptionImages[item.value]
    },
    getSelectedValue(option) {
      return _.get(_.find(option.items, { selected: true }), 'value') || ''
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
      this.currentVariant = _.find(this.product.variants, { id: frozenVariant.id })
      this.calcSelectedAndDisabled()  // 要重新执行一次修改 selected 和 disabled
    },
    pairVariantOptions() {
      // variants 转化成 { id, [title]: [value], ... } 的形式
      return _.map(this.product.variants, (variant) => {
        const data = { id: variant.id }
        _.forEach(variant.options, ({ title, value }) => data[title] = value)
        return data
      })
    },
    onClickAddToCart() {
      if (!this.currentVariant.id) {
        Taro.showModal({
          title: '加入购物车失败',
          content: '请先选择商品规格',
          showCancel: false
        })
        return
      }
      this.$store.dispatch('cart/add', {
        variantId: this.currentVariant.id,
        quantity: this.quantity,
        attributes: {}
      }).then(() => {
        // Taro.vibrateShort()
        Taro.showToast({ title: '成功加入购物车', icon: 'none', duration: 1000 })
        this.isVisible = false  // 这个执行了以后自动会调用 onDrawerClose
      }).catch(handleErr)
    },
    onClickBuyNow() {
      if (!this.currentVariant.id) {
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
          variant_id: this.currentVariant.id
        }]
      }).then(({ token }) => {
        Taro.hideLoading()
        this.isVisible = false  // 这个执行了以后自动会调用 onDrawerClose
        Taro.navigateTo({ url: `/pages/checkout/index?token=${token}` })
      }).catch((err) => {
        Taro.hideLoading()
        handleErr(err)
      })
    },
    onPreviewImage() {
      const url = _.get(this.currentVariant, 'image.src')
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
