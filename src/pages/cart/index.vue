<template>
  <view>
    <view v-for="item in cart.items" :key="item.variant_id">
      <text>{{ item.variant.id }} {{ item.quantity }}</text>
    </view>
  </view>
</template>

<script>
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
  }
}
</script>

<style lang="scss"></style>
