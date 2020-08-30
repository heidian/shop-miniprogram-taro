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
import './index.scss'

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

<style lang="scss"></style>
