<template>
  <view>
    <view v-for="product in products.data">
      <text>{{ product.id }}</text>
    </view>
  </view>
</template>

<script>
import ListTable from '@/mixins/ListTable'

// const listTableMixin = ListTable('products', { storeName: 'lists/products' })
const listTableMixin = ListTable('products', { urlRoot: '/shopfront/product/' })

export default {
  name: 'Search',
  mixins: [
    listTableMixin
  ],
  components: {},
  async mounted() {
    this.fetchList()
  }
}
</script>

<style lang="scss"></style>
