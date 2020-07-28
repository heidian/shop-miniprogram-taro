<template>
  <view>
    <view v-for="inventoryItem in inventoryItems.data">
      <text>{{ inventoryItem.id }}</text>
    </view>
  </view>
</template>

<script>
import ListTable from '@/mixins/ListTable'

const listTableMixin = ListTable('inventoryItems', { storeName: 'lists/inventoryItems' })

export default {
  name: 'Inventory',
  mixins: [
    listTableMixin
  ],
  components: {},
  async mounted() {
    await this.$store.dispatch('lists/inventoryItems/list')
  }
}
</script>

<style lang="scss"></style>
