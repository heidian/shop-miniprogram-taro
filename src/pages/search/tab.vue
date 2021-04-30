<template>
  <view :class="$style['page']" :style="{'paddingTop': pagePaddingTop, ...$globalColors}">
    <!-- <custom-nav
      :q="products.filter.q"
      @submit="onSubmitSearch"
    ></custom-nav> -->

    <search-filters
      ref="searchFilters"
      :products="products"
      :getFilter="getFilter"
      :updateFilter="updateFilter"
      :updateOrderBy="updateOrderBy"
    ></search-filters>

    <floating-buttons />

    <view :class="$style['productGrids']">
      <view v-for="product in products.data" :key="product.id" :class="$style['gridWrapper']">
        <product-item :product="product"></product-item>
      </view>
    </view>
    <!-- TODO 加一个 loading/more 的状态 -->
  </view>
</template>

<script>
import SearchMixin from './search'
export default {
  name: 'SearchTab',
  mixins: [ SearchMixin ]
}
</script>

<style lang="scss" module>
@import './search';
</style>
