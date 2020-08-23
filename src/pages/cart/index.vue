<template>
  <view>
    <view v-for="item in cart.items" :key="item.variant_id">
      <text>{{ item.variant.id }} {{ item.quantity }}</text>
      <input type='text' placeholder='输入数字' @input="(e) => setItemQuantity(e, item.id)"></Input>
      <button @tap="removeItem(item.id)">删除</button>
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
    setItemQuantity: _.debounce(function(e, itemId) {
      const quantity = +e.detail.value
      this.$store.dispatch('cart/setItemQuantity', { itemId, quantity })
    }, 500),
    removeItem(itemId) {
      this.$store.dispatch('cart/removeItem', { itemId })
    }
  }
}
</script>

<style lang="scss"></style>
