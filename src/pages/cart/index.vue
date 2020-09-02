<template>
  <view class="page--cart">
    <view class="cart-group">
      <view class="cart-item" v-for="item in cart.items" :key="item.variant_id">
        <view class="cart__delete" @tap="removeItem(item.id)">删除</view>
        <movable-area class="movable-area">
          <movable-view
            class="movable-view"
            out-of-bounds="true" direction="horizontal" :inertia="true"
            :x="movable.x[item.id]"
            @change="(e) => handleMovableChange(e, item.id)"
            @touchstart="(e) => handleTouchStart(e, item.id)"
            @touchend="(e) => handleTouchEnd(e, item.id)"
          >
            <view class="cart__check" @tap="checkItem(item.id, item.checked ? false : true)">
              <icon v-if="item.checked" type="success" size="20" color="#ff5a00"></icon>
              <icon v-else type="circle" size="20"></icon>
            </view>
            <image class="cart__image" :src="optimizeImage(item.variant.image)" mode="aspectFill"></image>
            <view class="cart__product">{{ item.product.title }}</view>
            <view class="cart__variant">{{ item.variant|variantTitle }}</view>
            <view class="cart__bottom">
              <view class="cart__price">{{ item.variant.price|currency({ removeTrailingZero: true }) }}</view>
              <input-number
                class="cart__quantity"  type='number' placeholder='输入数字'
                :min="1" :value="item.quantity" @change="(quantity) => setItemQuantity(quantity, item.id)"
              ></input-number>
            </view>
          </movable-view>
        </movable-area>
      </view>
    </view>
    <infinite-products ref="infiniteProducts"></infinite-products>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage } from '@/utils/image'
import InputNumber from '@/components/InputNumber'
import InfiniteProducts from '@/components/InfiniteProducts/InfiniteProducts'

export default {
  name: 'Cart',
  components: {
    InputNumber,
    InfiniteProducts
  },
  data() {
    return {
      movable: {
        realX: {},
        x: {}
      }
    }
  },
  computed: {
    ...mapState('cart', {
      cart: (state) => state
    })
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6'
    })
  },
  async mounted() {
    // 好像不需要 fetch, cart 在 store 里, 打开小程序 fetch 一次, 之后任何地方操作都会更新 store
    // await this.$store.dispatch('cart/fetch')
  },
  onReachBottom() {
    this.$refs.infiniteProducts.onReachBottom()
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
    }
  },
  filters: {
    variantTitle(variant) {
      return _.map(variant.options || [], 'value').join(' ') || '-'
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/_mixins';
$color-orange: #ff5a00;
$color-text: #262626;
$color-text-light: #666666;
$color-divider: #f0f0f0;
$color-bg-gray: #f6f6f6;
page {
  background-color: $color-bg-gray;
}
.page--cart {
  // padding: 10px;
  overflow: hidden;
  .cart-group {
    background-color: #fff;
    border-radius: 6px;
    overflow: hidden;
    margin: 10px;
    padding: 10px 0;
  }
  .cart-item {
    height: 100px;
    width: 100%;
    position: relative;
    overflow: hidden;
    // font-size: 13px;
    padding-right: 60px;
    .movable-area {
      height: 100%;
      width: 100%;
      position: relative;
    }
    .movable-view {
      padding: 10px 10px 10px 135px;
      background-color: #fff;
      height: 100%;
      width: calc(100% + 60px);
      position: relative;
    }
  }
  .cart__check {
    position: absolute;
    top: 10px;
    width: 45px;
    left: 0;
    height: 80px;
    padding: 30px 10px 30px 15px;
  }
  .cart__image {
    position: absolute;
    left: 45px;
    top: 10px;
    height: 80px;
    width: 80px;
  }
  .cart__product {
    /* -webkit-line-clamp 定义了以后不需要再写高度, 自动会设置高度为两个行高
    但是 overflow: hidden 依然需要, 不然尺寸限制了, 内容还是会超出 */
    @include ellipsis(2);
    // margin-bottom: 5px;
    line-height: 20px;
    height: 40px;  /* 但是设置了高度可以看起来比较整齐 */
    margin-top: -3px;
  }
  .cart__variant {
    @include ellipsis();
    color: $color-text-light;
    font-size: 0.85em;
    line-height: 20px;
  }
  .cart__bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .cart__price {
    color: $color-orange;
    font-weight: bold;
  }
  .cart__quantity {
    width: 100px;
    .input-number__btn, .input-number__input {
      height: 20px;
      font-size: 13px;
    }
  }
  .cart__delete {
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
}
</style>
