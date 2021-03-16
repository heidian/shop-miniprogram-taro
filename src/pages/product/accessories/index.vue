<template>
  <view
    :class="{[$style['page']]: true, [$style['pageIphoneX']]: isLikeIphoneX}"
    :style="$globalColors"
  >
    <view :class="$style['pageSection']">
      <view :class="$style['cartGroup']">
        <view :class="$style['cartItem']">
          <view :class="$style['itemContainter']">
            <view :class="$style['itemCheck']">
              <icon v-if="mainCartItem.checked" type="success" size="20" :color="$globalColors['--color-primary']"></icon>
              <view v-else :class="$style['disabledCheckbox']" style="width: 20px;height: 20px;"></view>
              <!-- <icon v-else type="circle" size="20"></icon> -->
            </view>
            <image :class="$style['variantImage']" :src="optimizeImage(mainCartItem.variant && mainCartItem.variant.image, 100)" mode="aspectFill"></image>
            <view :class="$style['productTitle']">{{ mainCartItem.product && mainCartItem.product.title }}</view>
            <view :class="$style['variantTitle']" @tap="() => onOpenVariantsDrawer(mainCartItem)">{{ mainCartItem.variant|variantTitle }}</view>

            <view v-if="mainCartItem.variant && mainCartItem.variant.is_available" :class="$style['priceAndQuantity']">
              <price :price="mainCartItem.variant ? mainCartItem.variant.price : ''" :highlight="true" :keepZero="true"></price>
              <input-number
                :class="$style['lineQuantity']"
                :min="1" :max="getQuantityMaxValue(mainCartItem)" :value="mainCartItem.quantity" @change="(quantity) => mainCartItem.quantity = +quantity"
              ></input-number>
            </view>
            <view v-else :class="$style['unavailableHint']">当前规格缺货</view>
          </view>
        </view>
        <view :class="$style['cartItem']" v-for="item in otherCartItems" :key="item.product.id">
          <view :class="$style['itemContainter']">
            <view v-if="item.variant && item.variant.is_available" :class="$style['itemCheck']" @tap="() => checkItem(item)">
              <icon v-if="item.checked" type="success" size="20" :color="$globalColors['--color-primary']"></icon>
              <icon v-else-if="item.variant && item.variant.is_available" type="circle" size="20"></icon>
            </view>
            <view v-else :class="$style['itemCheck']">
              <view :class="$style['disabledCheckbox']" style="width: 20px;height: 20px;"></view>
            </view>
            <image :class="$style['variantImage']" :src="optimizeImage(item.variant && item.variant.image, 100)" mode="aspectFill"></image>
            <view :class="$style['productTitle']">{{ item.product.title }}</view>
            <view :class="$style['variantTitle']" @tap="() => onOpenVariantsDrawer(item)">{{ item.variant|variantTitle }}</view>
            <view v-if="item.variant && item.variant.is_available" :class="$style['priceAndQuantity']">
              <price :price="item.variant ? item.variant.price : ''" :highlight="true" :keepZero="true"></price>
              <input-number
                :class="$style['lineQuantity']"
                :min="0" :max="getQuantityMaxValue(item)" :value="item.quantity" @change="(quantity) => item.quantity = +quantity"
              ></input-number>
            </view>
            <view v-else :class="$style['unavailableHint']">当前规格缺货</view>
          </view>
        </view>
      </view>
    </view>
    <view :class="{[$style['footer']]: true, [$style['isLikeIphoneX']]: isLikeIphoneX}">
      <view :class="[$style['footerIconBtn']]">
        <view :class="$style['footerIconBtnText']">合计</view>
        <price :price="totalPrice || ''" :highlight="true" :keepZero="true"></price>
      </view>
      <button
        :class="[$style['footerBtn'], 'button', 'button--primary', 'button--outline', 'button--small', 'button--round']"
        @tap="handleAddtoCart"
      >加入购物车</button>
      <button
        :class="[$style['footerBtn'], 'button', 'button--primary', 'button--small', 'button--round']"
        @tap="handleBuyNow"
      >立即购买</button>
    </view>

    <select-variant
      :visible.sync="variantsDrawer.visible"
      :product="variantsDrawer.product"
      :variant="variantsDrawer.currentVariant"
      @selectVariant="onSelectVariant"
      @close="onCloseVariantsDrawer"
    ></select-variant>
  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { handleErr } from '@/utils/errHelper'
import SelectVariant from '@/components/SelectVariant/SelectVariant'
import Price from '@/components/Price'
import InputNumber from '@/components/InputNumber'

const productFields = [
  'id', 'variants', 'name', 'title', 'description', 'image', 'price', 'compare_at_price',
  'is_available', 'inventory_quantity', 'inventory_policy', 'options', 'images'
].join(',')

export default {
  name: 'Accessories',
  components: {
    SelectVariant,
    Price,
    InputNumber,
  },
  data() {
    /* getCurrentInstance 只在生命周期方法里用, 一般在 created() 或者 data() 方法里面用 */
    return {
      panding: false,
      product: {},
      productId: null,
      mainCartItem: {},
      otherCartItems: [
        // {
        //   productId,
        //   productTitle,
        //   variant,
        //   quantity,
        //   note: ''
        // }
      ],
      variantsDrawer: {
        visible: false,
        product: {},
        currentVariant: {}
      }
    }
  },
  created() {
    const { product: productId } = getCurrentInstance().router.params
    this.productId = +productId
  },
  async mounted() {
    // 初始化过滤参数
    if (!this.productId) return
    await Promise.all([this.fetchProduct(), this.fetchProductsAccessories()])

  },
  computed: {
    ...mapGetters('system', ['isLikeIphoneX']),
    checkedItem () {
      return _.filter([this.mainCartItem ,...this.otherCartItems], { checked: true })
    },
    totalPrice () {
      const value = _.reduce(this.checkedItem, (res, item) => res + +_.get(item, 'variant.price') * +item.quantity, 0)
      return value.toFixed(2)
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    getProductSelectedVariant (product) {
      if (!product || _.isEmpty(product.variants)) return null
      return _.find(product.variants, { is_available: true }) || product.variants[0]
    },
    /* 方法名称用驼峰 */
    async fetchProduct() {
      let product = null
      if (this.productId) {
        try {
          const res = await API.get(`/shopfront/product/${this.productId}/`, {
            params: { fields: productFields }
          })
          product = res.data
        } catch(err) { console.log(err) }
      } else if (this.productName) {
        /* 不要拼接 url, 用 params */
        try {
          const res = await API.get('/shopfront/product/', {
            params: { fields, name: this.productName }
          })
          product = res.data.results[0]
        } catch(err) { console.log(err) }
        /* res.data.results 一定是数组不会有问题, 只需要看长度就行 */
      }
      if (product) {
        this.product = product
        this.productId = product.id

        const selectedVariant = this.getProductSelectedVariant(product)
        this.mainCartItem = {
          product,
          variant: selectedVariant,
          quantity: selectedVariant && selectedVariant.is_available ? 1 : 0,
          isMain: true,
          checked: selectedVariant && selectedVariant.is_available ? true : false,
        }
      } else {
        Taro.showModal({
          title: '找不到商品',
          content: '商品链接错误',
          showCancel: false
        })
      }
    },
    async fetchProductsAccessories () {
      const params = {
        fields: productFields,
        page_size: 6
      }
      const url = `/shopfront/product/${this.productId}/accessories/`
      try {
        const res = await API.get(url, { params })
        const results = _.isArray(res.data) ? res.data : _.get(res.data, 'results', [])
        _.forEach(results, product => {
          const selectedVariant = this.getProductSelectedVariant(product)
          this.otherCartItems.push({
            product,
            variant: selectedVariant,
            quantity: selectedVariant && selectedVariant.is_available ? 1 : 0,
            isMain: false,
            checked: selectedVariant && selectedVariant.is_available ? true : false,
          })
        })
      } catch (error) {
        console.log(error)
      }
    },
    checkItem (item = {}) {
      const { variant, product, isMain, checked, quantity } = item
      const matchedItem = _.find(this.otherCartItems, item => {
        return _.get(item.product, 'id') === product.id
      })
      if (!matchedItem) return
      matchedItem.checked = !matchedItem.checked
    },
    onOpenVariantsDrawer ({product, variant}) {
      this.variantsDrawer = {
        visible: true,
        product: { ...product },
        currentVariant: { ...variant }
      }
    },
    onCloseVariantsDrawer() {
      // 这里一定要监听 close 然后把 visible 变成 false, 不然再点击打开, 组件检测不到变化
      // this.variantsDrawer = { visible: false, product: {}, currentVariant: {} }
    },
    getQuantityMaxValue (item = {}) {
      if (!item.variant || !item.variant.is_available) {
        return 0
      }
      const { inventory_policy = 'deny', inventory_quantity = 0 } = item.variant
      if (inventory_policy === 'continue') return 999999
      else return inventory_quantity
    },
    onSelectVariant(variantId) {
      // 用回同一个 SelectVariant 组件，所以接收的参数也是一样的，在此场景下 quantity 在页面里选择，而不是在组件里选择，所以这里🈯️需要接收 variantId
      const { product, currentVariant } = this.variantsDrawer
      if (!variantId || currentVariant.id === variantId) return
      const variant = _.find(product.variants, { id: variantId })

      if (product.id === this.productId) {
        // 主商品
        this.mainCartItem.variant = { ...variant }
        this.mainCartItem.checked = variant && variant.is_available
      } else {
        const matchedItem = _.find(this.otherCartItems, item => {
          return _.get(item.product, 'id') === product.id
        })
        if (!matchedItem) return
        matchedItem.variant = { ...variant }
        matchedItem.checked = variant && variant.is_available
      }
      this.onCloseVariantsDrawer()
    },
    handleAddtoCart () {
      const promiseList = _.map(this.checkedItem, ({ product, variant, quantity = 1 }) => {
        const attributes = {}
        if (product.id !== this.productId) {
          attributes['商品'] = _.get(this.product, 'title')
        }
        return this.$store.dispatch('cart/add', { variantId: variant.id, quantity, attributes })
      })
      Promise.all(promiseList).then(() => {
        Taro.vibrateShort()
        Taro.showToast({ title: '成功加入购物车', icon: 'none', duration: 1000 })
      }).catch(handleErr)
    },
    async handleBuyNow () {
      // requestSubscribeMessage(['order_payment_succeeds', 'fulfillment_notice'])
      const lines = _.map(this.checkedItem, ({ product, variant, quantity = 1 }) => {
        const attributes = {}
        if (product.id !== this.productId) {
          attributes['商品'] = _.get(this.product, 'title')
        }
        return {
          variant_id: variant.id,
          quantity,
          attributes
        }
      })
      Taro.showLoading({ title: '正在下单中' })
      this.$store.dispatch('checkout/create', { lines }).then(({ token }) => {
        Taro.hideLoading()
        Taro.navigateTo({ url: `/pages/checkout/index?token=${token}` })
      }).catch((err) => {
        Taro.hideLoading()
        handleErr(err)
      })
    }
  },
  filters: {
    variantTitle(variant) {
      if (!variant) return ' - '
      return _.map(variant.options || [], 'value').join(' ') || '-'
    }
  }
}

</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.page {
  overflow: hidden;
  padding-bottom: 50px;
  position: relative;
  background-color: $color-bg-gray;
}
.page.pageIphoneX {
  padding-bottom: 65px;
}
.pageSection {
  overflow: hidden;
  background-color: #ffffff;
  & + & {
    margin-top: 10px;
  }
}
.pageSectionTitle {
  padding: 10px 15px;
  text-align: center;
  line-height: 40px;
  font-size: 15px;
  font-weight: bold;
}

/* Images Swiper */
.productImages {
  width: 100vw;
  height: 100vw;
}
.productImagesSwiperItemImage {
  width: 100%;
  height: 100%;
}

.accessories {
  min-height: 100vh;
  position: relative;
  padding-bottom: 64px;
}

.cartGroup {
  background-color: #fff;
  border-radius: 6px;
  overflow: hidden;
  margin: 10px;
  padding: 10px 0;
}
.cartItem {
  height: 100px;
  width: 100%;
  position: relative;
  overflow: hidden;
  // font-size: 13px;
  padding-right: 60px;
}
// .movableArea {
//   height: 100%;
//   width: 100%;
//   position: relative;
// }
.itemContainter {
  padding: 10px 10px 10px 135px;
  background-color: #fff;
  height: 100%;
  width: calc(100% + 60px);
  position: relative;
}
.itemCheck {
  position: absolute;
  top: 10px;
  width: 45px;
  left: 0;
  height: 80px;
  padding: 30px 10px 30px 15px;
}
.disabledCheckbox {
  width: 20px;
  height: 20px;
  border: 1px solid $color-text-lighter;
  border-radius: 50%;
  background-color: #e0e0e0;
}
.variantImage {
  position: absolute;
  left: 45px;
  top: 10px;
  height: 80px;
  width: 80px;
}
.productTitle {
  /* -webkit-line-clamp 定义了以后不需要再写高度, 自动会设置高度为两个行高
  但是 overflow: hidden 依然需要, 不然尺寸限制了, 内容还是会超出 */
  @include ellipsis(2);
  // margin-bottom: 5px;
  line-height: 20px;
  height: 40px;  /* 但是设置了高度可以看起来比较整齐 */
  margin-top: -3px;
}
.variantTitle {
  @include ellipsis();
  color: $color-text-light;
  font-size: 0.85em;
  line-height: 20px;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    border: 4px solid transparent;
    border-top-color: $color-text;
    margin-left: 8px;
    margin-top: -2px;
  }
}
.priceAndQuantity {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.unavailableHint {
  font-size: 12px;
  line-height: 24px;
  height: 24px;
  color: $color-text-lighter;
}
.lineQuantity {
  width: 100px;
  :global(.input-number__btn),
  :global(.input-number__input) {
    height: 20px;
    font-size: 13px;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  width: 100%;
  padding: 7px 10px;
  background-color: #ffffff;
  box-shadow: 0 -1px 0 0 $color-divider;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  &.isLikeIphoneX {
    height: 65px;
    padding-bottom: 22px;
  }
}
.footerBtn {
  margin-left: 10px;
  flex: 1;
}
.footerIconBtn {
  margin-right: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.footerIconBtnText {
  font-size: 10px;
  overflow: hidden;
  display: block;
  white-space: nowrap;
}

</style>


