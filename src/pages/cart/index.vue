<template>
  <view class="page--cart">
    <view class="cart-group">
      <view
        v-for="item in cart.items" :key="item.variant_id"
        class="cart-item"
      >
        <view class="cart-item__check" @tap="checkItem(item.id, item.checked ? false : true)">
          <icon v-if="item.checked" type="success" size="20" color="#ff5a00"></icon>
          <icon v-else type="circle" size="20"></icon>
        </view>
        <image class="cart-item__image" :src="optimizeImage(item.variant.image)" mode="aspectFill"></image>
        <view class="cart-item__product">{{ item.product.title }}</view>
        <view class="cart-item__variant">{{ item.variant|variantTitle }}</view>
        <view class="cart-item__bottom">
          <view class="cart-item__price">{{ item.variant.price|currency({ removeTrailingZero: true }) }}</view>
          <input class="cart-item__quantity" type='text' placeholder='输入数字'
            @input="(e) => setItemQuantity(e, item.id)"/>
        </view>
        <!-- <button @tap="removeItem(item.id)">删除</button> -->
      </view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage } from '@/utils/image'

export default {
  name: 'Cart',
  components: {},
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
  mounted() {
    this.$store.dispatch('cart/fetch')
  },
  methods: {
    optimizeImage,
    setItemQuantity: _.debounce(function(e, itemId) {
      // cart store 里面不做限制, 但是这里 debounce 一下, 停止输入 1 秒以后再发
      const quantity = +e.detail.value
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
  padding: 10px;
  .cart-group {
    background-color: #fff;
    border-radius: 6px;
  }
  .cart-item {
    padding: 10px 10px 10px 135px;
    height: 100px;
    position: relative;
    // font-size: 13px;
    &__check {
      position: absolute;
      top: 10px;
      width: 45px;
      left: 0;
      height: 80px;
      padding: 30px 10px 30px 15px;
    }
    &__image {
      position: absolute;
      left: 45px;
      top: 10px;
      height: 80px;
      width: 80px;
    }
    &__product {
      /* -webkit-line-clamp 定义了以后不需要再写高度, 自动会设置高度为两个行高
      但是 overflow: hidden 依然需要, 不然尺寸限制了, 内容还是会超出 */
      @include ellipsis(2);
      // margin-bottom: 5px;
      line-height: 20px;
      height: 40px;  /* 但是设置了高度可以看起来比较整齐 */
      margin-top: -3px;
    }
    &__variant {
      @include ellipsis();
      color: $color-text-light;
      font-size: 0.85em;
      line-height: 20px;
    }
    &__bottom {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    &__price {
      color: $color-orange;
      font-weight: bold;
    }
    &__quantity {
      border: 1px solid $color-divider;
      width: 100px;
    }
  }
}
</style>
