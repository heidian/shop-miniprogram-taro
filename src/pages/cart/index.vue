<template>
  <view>
    <view v-for="item in cart.items" :key="item.variant_id">
      <text>{{ item.variant.id }} {{ item.quantity }}</text>
      <input type='text' placeholder='输入金额' @input="(e) => setQuantity(e, item.id)"></Input>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'Cart',
  components: {},
  computed: {
    ...mapState('cart', {
      cart: (state) => state
    })
  },
  mounted() {
    this.$store.dispatch('cart/fetch')
  },
  methods: {
    // cart store 里面不做限制, 但是这里 debounce 一下, 防止一边输入一边发请求
    setQuantity: _.debounce(function(e, itemId) {
      const quantity = +e.detail.value || 1
      this.$store.dispatch('cart/setQuantity', { itemId, quantity })
    }, 500)
  }
}
</script>

<style lang="scss"></style>
