<template>
  <view>
    <scroll-view
      :class="$style['categoriesBar']"
      :style="{'top': categoriesBarTop}"
      :scroll-x="true" :enhanced="true" :show-scrollbar="false"
      :scroll-into-view="activeRootCategoryId ? `search-category-${activeRootCategoryId}` : null"
      :scroll-with-animation="true"
    >
      <view :class="$style['categoriesInner']">
        <view
          :class="[$style['categoryItem'], !activeRootCategoryId && 'is-active']"
          @tap="() => filterRootCategory(null)"
        ><text :class="$style['categoryText']">全部</text></view>
        <view
          v-for="category in categories.data" :key="category.id"
          :class="[$style['categoryItem'], (category.id === activeRootCategoryId) && 'is-active']"
          :id="`search-category-${category.id}`"
          @tap="() => filterRootCategory(category.id)"
        ><text :class="$style['categoryText']">{{ category.title }}</text></view>
      </view>
    </scroll-view>
    <view :class="$style['filterBar']" :style="{'top': filtersBarTop}">
      <view
        :class="{[$style['filterItem']]:true,'is-active':products.orderBy==='-published_at'}"
        @tap="onClickOrderBy('-published_at')"
      >新品</view>
      <view
        :class="{[$style['filterItem']]:true,'is-active':products.orderBy==='price'}"
        @tap="onClickOrderBy('price')"
      >价格</view>
      <view
        :class="{[$style['filterItem']]:true,'is-active':products.orderBy==='-sold_quantity'}"
        @tap="onClickOrderBy('-sold_quantity')"
      >销量</view>
      <view
        :class="{
          [$style['filterItem']]: true,
          'is-active': activeRootCategoryId && +products.filter.category !== activeRootCategoryId
        }"
        @tap="subCategoryDrawerVisible = !subCategoryDrawerVisible"
      >筛选</view>
    </view>
    <drawer
      v-if="!!activeRootCategoryId" :visible.sync="subCategoryDrawerVisible"
      position="right" header="筛选" :style="{'top': filtersDrawerTop}"
    >
      <view :class="$style['subCategoriesWrapper']">
        <view
          @tap="() => filterRootCategory(activeRootCategoryId)"
          :class="[$style['subCategoryItem'], (activeRootCategoryId === +products.filter.category) && 'is-active']"
        >全部</view>
        <view
          v-for="item in activeSubCategories" :key="item.id" @tap="() => filterSubCategory(item.id)"
          :class="[$style['subCategoryItem'], (item.id === +products.filter.category) && 'is-active']"
        >{{ item.title }}</view>
      </view>
    </drawer>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import Drawer from '@/components/Drawer'

export default {
  components: {
    Drawer,
  },
  props: {
    products: {
      required: true,
      default: () => ({
        filter: {},
        orderBy: null,
        data: [],
      })
    }
  },
  data() {
    return {
      activeRootCategoryId: null,
      subCategoryDrawerVisible: false,
    }
  },
  created() {},
  computed: {
    ...mapState(['categories', 'system']),
    ...mapGetters('categories', [
      'getRootCategoryId'
    ]),
    customNavHeight() {
      return this.system.statusBarHeight + 44
    },
    customNavStyle() {
      return {
        'height': Taro.pxTransform(this.customNavHeight),
        'paddingTop': Taro.pxTransform(this.system.statusBarHeight + 3)
      }
    },
    categoriesBarTop() {
      return Taro.pxTransform(this.customNavHeight)
    },
    filtersBarTop() {
      return Taro.pxTransform(this.customNavHeight + 35)
    },
    filtersDrawerTop() {
      return Taro.pxTransform(this.customNavHeight)
    },
    activeSubCategories() {
      const category = _.find(this.categories.data, { id: this.activeRootCategoryId })
      return category ? category.children : []
    },
  },
  mounted() {
    this.activeRootCategoryId = this.getRootCategoryId(this.products.filter.category)
  },
  methods: {
    filterRootCategory(categoryId) {
      this.subCategoryDrawerVisible = false
      // 虽然 updateFilter 以后再通过 watch 机制回来也会计算 activeRootCategoryId, 但这里早点设置也没事
      this.activeRootCategoryId = categoryId
      // 因为有 partial: false, 这里其实不需要专门把 q 重置为空, 为了避免混淆, 现在先这么保留着
      this.$emit('updateFilter', { q: '', category: categoryId })
    },
    filterSubCategory(categoryId) {
      this.subCategoryDrawerVisible = false
      // 因为有 partial: false, 这里其实不需要专门把 q 重置为空, 为了避免混淆, 现在先这么保留着
      this.$emit('updateFilter', { q: '', category: categoryId })
    },
    onClickOrderBy(orderBy) {
      if (this.products.orderBy === orderBy) {
        orderBy = ''
      }
      this.$emit('updateOrderBy', orderBy)
    },
  },
  watch: {
    'products.filter': {
      handler: function(newVal) {
        this.activeRootCategoryId = this.getRootCategoryId(this.products.filter.category)
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.categoriesBar {
  position: fixed;
  z-index: $z-index-navbar;
  left: 0;
  // top: 0;  // inline 动态定义
  height: 35px;
  width: 100%;
  background-color: #fff;
}
.categoriesInner {
  display: inline-block;
  white-space: nowrap;
  padding: 0 5px;
}
.categoryItem {
  display: inline-block;
  vertical-align: middle;
  padding: 0 12px;
  .categoryText {
    display: inline-block;
    font-size: 15px;
    padding-top: 5px;
    border-bottom: 2px solid transparent;
    line-height: 35px - 5px - 2px;
    color: $color-text-light;
  }
  &:global(.is-active) {
    .categoryText {
      border-bottom-color: $color-text;
      color: $color-text;
      font-weight: bold;
    }
  }
}
.filterBar {
  position: fixed;
  z-index: $z-index-navbar;
  left: 0;
  // top: 35px;  // inline 动态定义
  height: 39px;
  border-top: 1px solid $color-divider;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
}
.filterItem {
  padding: 4px 9px;
  border: 1px solid transparent;
  width: 70px;
  text-align: center;
  font-size: 12px;
  line-height: 16px;
  border-radius: 13px;
  color: $color-text-light;
  background-color: $color-bg-gray;
  &:global(.is-active) {
    // border-color: darken($color-bg-gray, 10%);
    // border-color: $color-text;
    background-color: darken($color-bg-gray, 10%);
    color: $color-text;
    font-weight: bold;
  }
}
.subCategoriesWrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
}
.subCategoryItem {
  padding: 8px 15px;
  font-size: 13px;
  color: $color-text-light;
  &:global(.is-active) {
    color: $color-text;
    font-weight: bold;
  }
}
</style>
