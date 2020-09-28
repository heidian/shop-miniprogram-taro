<template>
  <view :class="$style['page']">
    <view :class="$style['cartGroup']" v-if="cart.items.length">
      <view :class="$style['cartItem']" v-for="item in cart.items" :key="item.variant_id">
        <view :class="$style['cartDelete']" @tap="removeItem(item.id)">删除</view>
        <movable-area :class="$style['movableArea']">
          <movable-view
            :class="$style['movableView']"
            out-of-bounds="true" direction="horizontal" :inertia="true"
            :x="movable.x[item.id]"
            @change="(e) => handleMovableChange(e, item.id)"
            @touchstart="(e) => handleTouchStart(e, item.id)"
            @touchend="(e) => handleTouchEnd(e, item.id)"
          >
            <view :class="$style['itemCheck']" @tap="checkItem(item.id, item.checked ? false : true)">
              <icon v-if="item.checked" type="success" size="20" color="#ff5a00"></icon>
              <icon v-else type="circle" size="20"></icon>
            </view>
            <image :class="$style['variantImage']" :src="optimizeImage(item.variant.image, 100)" mode="aspectFill"></image>
            <view :class="$style['productTitle']">{{ item.product.title }}</view>
            <view :class="$style['variantTitle']">{{ item.variant|variantTitle }}</view>
            <view :class="$style['priceAndQuantity']">
              <price :price="item.variant.price" :highlight="true" :keepZero="true"></price>
              <input-number
                :class="$style['lineQuantity']"
                :min="1" :value="item.quantity" @change="(quantity) => setItemQuantity(quantity, item.id)"
              ></input-number>
            </view>
          </movable-view>
        </movable-area>
      </view>
    </view>
    <view v-else :class="$style['emptyCart']">
      <image
        :class="$style['emptyCartImage']"mode="widthFix"
        src="https://up.img.heidiancdn.com/o_1cb4m55ljp1m92j1rpfk421up70ingbag.png"
      ></image>
      <view>您的购物车没有商品</view>
    </view>
    <view :class="$style['footer']">
      <view>
        <text>总计:</text>
        <price :price="cart.totalPrice" :highlight="true" :keepZero="true"></price>
      </view>
      <button
        class="button--round button--orange button--small"
        :disabled="checkoutPending || cartIsEmpty" @tap="checkout"
      >{{ checkoutPending ? '正在请求...' : '结算' }}</button>
    </view>
    <view style="margin-top: 20px; text-align: center;">猜你喜欢</view>
    <infinite-products></infinite-products>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage } from '@/utils/image'
import { handleErr } from '@/utils/errHelper'
import Price from '@/components/Price'
import InputNumber from '@/components/InputNumber'
import InfiniteProducts from '@/components/InfiniteProducts'

export default {
  name: 'Cart',
  components: {
    Price,
    InputNumber,
    InfiniteProducts
  },
  data() {
    return {
      checkoutPending: false,
      movable: {
        realX: {},
        x: {}
      }
    }
  },
  computed: {
    ...mapState('cart', {
      cart: (state) => state
    }),
    cartIsEmpty() {
      return _.isEmpty(_.filter(this.cart.items, item => item.checked))
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#f6f6f6',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  async mounted() {
    // 好像不需要 fetch, cart 在 store 里, 打开小程序 fetch 一次, 之后任何地方操作都会更新 store
    // await this.$store.dispatch('cart/fetch')
  },
  onReachBottom() {
    this.$store.dispatch('lists/infiniteProducts/listMore')
  },
  onShow() {
    // infiniteProducts store 不会每次都去获取, 这里反复调用没关系
    // 这里 onShow 的时候调用, 目的是可以让 infiniteProducts 定期刷新下, 不一定要放 cart 页面, 放在 account 页面也行
    this.$store.dispatch('lists/infiniteProducts/refreshList')
  },
  methods: {
    optimizeImage,
    setItemQuantity: _.debounce(function(quantity, itemId) {
      // cart store 里面不做限制, 但是这里 debounce 一下, 停止输入 1 秒以后再发
      if (quantity) {
        // 如果是 0, 可能是删掉了内容要重新输入, 这时候不能更新, 否则这个 item 会被删除
        this.$store.dispatch('cart/setItemQuantity', { itemId, quantity })
      }
    }, 500),
    checkItem: _.throttle(function(itemId, checked) {
      // cart store 里面不做限制, 但是这里 throttle 一下, 点了以后 1 秒内不能再点
      this.$store.dispatch('cart/checkItem', { itemId, checked })
    }, 500),
    removeItem(itemId) {
      this.$store.dispatch('cart/removeItem', { itemId })
    },
    showDeleteButton(itemId) {
      this.movable.x = {
        ...this.movable.x,
        [itemId]: -60 - (Math.random() / 10)
        // 加一个随机数确保脏数据检查的时候永远不相等
      }
    },
    hideDeleteButton(itemId) {
      this.movable.x = {
        ...this.movable.x,
        [itemId]: 0 + (Math.random() / 10)
        // 加一个随机数确保脏数据检查的时候永远不相等
      }
    },
    handleMovableChange(e, itemId) {
      const { x, source } = e.detail
      this.movable.realX[itemId] = x
    },
    handleTouchStart(e, itemId) {},
    handleTouchEnd(e, itemId) {
      if (this.movable.realX[itemId] < -30) {
        this.showDeleteButton(itemId)
      } else {
        this.hideDeleteButton(itemId)
      }
    },
    checkout() {
      if (this.checkoutPending) {
        return
      }
      const items = _.filter(this.cart.items, item => item.checked)
      const lines = _.map(items, item => {
        return { variant_id: item.variant.id, quantity: item.quantity }
      })
      this.checkoutPending = true
      this.$store.dispatch('checkout/create', {
        cartToken: this.cart.cartToken,
        lines: lines,
      }).then(({ token }) => {
        this.checkoutPending = false
        Taro.navigateTo({ url: `/pages/checkout/index?token=${token}` })
      }).catch((err) => {
        this.checkoutPending = false
        handleErr(err)
        // checkout 创建接口的报错信息可能是在 non_field_errors 里面的
        // Taro.showModal({
        //   title: '创建结算失败',
        //   content: _.get(err, 'response.data.detail') || ('' + err),
        //   showCancel: false
        // })
      })
    }
  },
  filters: {
    variantTitle(variant) {
      return _.map(variant.options || [], 'value').join(' ') || '-'
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {
  overflow: hidden;
  padding-bottom: 60px;  // 底部 footer
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
.movableArea {
  height: 100%;
  width: 100%;
  position: relative;
}
.movableView {
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
}
.priceAndQuantity {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.lineQuantity {
  width: 100px;
  :global(.input-number__btn),
  :global(.input-number__input) {
    height: 20px;
    font-size: 13px;
  }
}
.cartDelete {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 100px;
  background-color: red;
  line-height: 100px;
  padding-left: 100px - 60px;
  text-align: center;
  color: #fff;
}
.emptyCart {
  padding: 20px;
  text-align: center;
  color: $color-text-light;
}
.emptyCartImage {
  width: 80px;
  height: auto;
  display: block;
  margin: 50px auto;
}
.footer {
  position: fixed;
  z-index: $z-index-footer;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 -1px 4px 0 rgba(0, 0, 0, 0.03);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
