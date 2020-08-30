<template>
  <view class="page--checkout">
    <view class="section"></view>
    <view class="section">
      <text class="section__header">商品</text>
    </view>
    <view class="section"></view>
    <view class="section">
      <view class="price-line"><text>商品金额</text><text>{{ getField('total_line_items_price')|currency }}</text></view>
      <view class="price-line"><text>运费</text><text>{{ getField('shipping_cost')|currency }}</text></view>
      <view class="price-line" v-for="discount in getField('discounts')" :key="discount.id">
        <text>{{ discount.description }}</text><text>{{ (-discount.discount_price)|currency }}</text>
      </view>
    </view>
    <view class="footer">
      <view>实付金额: <text class="highlight bold">{{ finalPrice|currency }}</text></view>
      <button class="button--payfororder button--round button--primary" type="primary">立即支付</button>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import { getCurrentInstance } from '@tarojs/taro'
// import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { mapState } from 'vuex'

export default {
  name: 'Checkout',
  components: {},
  computed: {
    ...mapState('checkout', {
      checkout: (state) => state
    }),
    finalPrice() {
      const totalPrice = this.getField('total_price')
      return totalPrice
    }
  },
  created() {
    const { token } = getCurrentInstance().router.params
    this.$store.commit('checkout/setData', { checkoutToken: token })
  },
  mounted() {
    this.$store.dispatch('checkout/fetch')
  },
  methods: {
    getField(path, defaultValue) {
      return _.get(this.checkout.data, path, defaultValue)
    }
  }
}
</script>

<style lang="scss">
$color-primary: #ff5a00;
$color-accent: #ff5a00;
$color-divider: #f8f8f8;
.page--checkout {
  min-height: 100vh;
  background-color: #f8f8f8;
  overflow: hidden;
  /* section */
  > .section {
    border-radius: 6px;
    background-color: #fff;
    margin: 8px;
    padding: 12px;
  }
  .section__header {
    margin-bottom: 12px;
    // font-size: 0.95em;
    font-weight: bold;
  }
  .price-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    & + .price-line {
      margin-top: 10px;
    }
  }
  /* footer */
  > .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #fff;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .button--payfororder {
    //
  }
}
/* 一些通用样式, 暂时先不移动到全局 app.scss 里面, 目前很多基础样式还没定
页面之间的样式在小程序里不会冲突, 只要同一个页面的组件之间区分好 class 就行 */
button {
  // button 标签是小程序和网页通用的, 这里定义样式的时候可以不用 css
  display: inline-block;
  font-size: 13px;
  line-height: 20px;
  padding: 8px 12px;
  // button 高度是 36
  border: 0;
  margin: 0;
  &::after {
    display: none;
  }
}
button.button--round {
  border-radius: 18px;
  padding-left: 16px;
  padding-right: 16px;
}
button.button--primary {
  color: #fff;
  background-color: $color-primary;
  &.button-hover {
    color: rgba(#fff, 0.9);
    background-color: lighten($color-primary, 5%);
  }
}
.highlight {
  color: $color-accent;
}
.bold {
  font-weight: bold;
}
</style>
