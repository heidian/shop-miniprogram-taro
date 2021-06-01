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
        <product-item :product="product" @preview="() => onPreview(product.id)"></product-item>
      </view>
    </view>

    <view v-if="products.pending" :class="$style['loading']"><text class="el-icon-more"></text></view>

    <product-preview
      :visible.sync="previewVisible"
      :product="currentProduct"
      :variant="currentVariant"
      @close="handleClosePreview"
    />
  </view>
</template>

<script>
import SearchMixin from './search'
export default {
  name: 'Search',
  mixins: [ SearchMixin ]
}
</script>

<style lang="scss" module>
@import './search';
</style>
