<template>
  <view :class="$style['page']">
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
    ></component>
    <scroll-view
      :class="$style['categoriesBar']"
      :scroll-x="true" :enhanced="true" :show-scrollbar="false"
      :scroll-into-view="activeRootCategoryId ? `home-category-${activeRootCategoryId}` : null"
      :scroll-with-animation="true"
    >
      <view :class="$style['categoriesInner']">
        <!-- 注意, 这里的 id 不能和 search 页面的 id 一样, 不然这里的事件会被绑定到 search 页面里, 结果就很怪异了 -->
        <view
          v-for="category in categories.data" :key="category.id"
          :class="[$style['categoryItem'], (category.id === activeRootCategoryId) && 'is-active']"
          :id="`home-category-${category.id}`"
          @tap="() => filterRootCategory(category.id)"
        ><text :class="$style['categoryText']">{{ category.title }}</text></view>
      </view>
    </scroll-view>
    <infinite-products></infinite-products>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import ThemeBlocks from '@/mixins/ThemeBlocks'
import InfiniteProducts from '@/components/InfiniteProducts'

export default {
  name: 'Home',
  mixins: [
    ThemeBlocks('blocks')
  ],
  components: {
    InfiniteProducts
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['categories']),
    ...mapState('lists/infiniteProducts', {
      infiniteProducts: (state) => state
    }),
    activeRootCategoryId() {
      return +this.infiniteProducts.filter.category
    }
  },
  created() {
    // TODO, 这里的颜色需要配置, 而不是写死
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  onReachBottom() {
    this.$store.dispatch('lists/infiniteProducts/listMore')
  },
  async mounted() {
    this.fetchPageConfig('home')
    this.$store.dispatch('categories/list')
  },
  methods: {
    filterRootCategory(categoryId) {
      this.$store.commit('lists/infiniteProducts/setLastRefreshed', null)
      this.$store.commit('lists/infiniteProducts/setFilter', { category: categoryId })
      this.$store.commit('lists/infiniteProducts/setPage', 1)
      this.$store.dispatch('lists/infiniteProducts/list')
    },
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {
  //
}
.categoriesBar {
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
</style>
