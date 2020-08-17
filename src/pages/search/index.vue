<template>
  <view>
    <view v-for="product in products.data">
      <text>{{ product.id }}</text>
    </view>
  </view>
</template>

<script>
import ListTable from '@/mixins/ListTable'

const listTableMixin = ListTable('products', { storeName: 'lists/products' })

export default {
  name: 'Search',
  mixins: [
    listTableMixin
  ],
  components: {},
  async mounted() {
    await this.$store.dispatch('lists/products/list')
  }
}
</script>

<style lang="scss"></style>
