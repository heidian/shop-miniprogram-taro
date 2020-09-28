<template>
  <view :class="$style['page']" :style="{'paddingTop': pagePaddingTop}">
    <custom-nav
      :q="products.filter.q"
      @submit="onSubmitSearch"
      :customStyle="customNavStyle"
      :homeBtnStyle="homeBtnStyle"
    />
    <scroll-view
      :class="$style['categoriesBar']"
      :style="{'top': categoriesBarTop}"
      :scroll-x="true" :enhanced="true" :show-scrollbar="false"
      :scroll-into-view="activeRootCategoryId ? `search-category-${activeRootCategoryId}` : null"
      :scroll-with-animation="true"
    >
      <view :class="$style['categoriesInner']">
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
    <view
      :class="[$style['subCategoriesWrapper'], subCategoryDrawerVisible && 'is-visible']"
      :style="{'top': subCategoriesWrapperTop}"
    >
      <view
        @tap="() => filterRootCategory(activeRootCategoryId)"
        :class="[$style['subCategoryItem'], (activeRootCategoryId === +products.filter.category) && 'is-active']"
      >全部</view>
      <view
        v-for="item in activeSubCategories" :key="item.id" @tap="() => filterSubCategory(item.id)"
        :class="[$style['subCategoryItem'], (item.id === +products.filter.category) && 'is-active']"
      >{{ item.title }}</view>
    </view>
    <virtual-list
      wclass="virtual-list"
      :height="listHeight"
      :item-data="listData"
      :item-count="listLength"
      :item-size="itemHeight"
      :item="ProductItem"
      width="100%"
      @scroll="onScroll"
    ></virtual-list>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import ProductItem from './ProductItem'
import CustomNav from './CustomNav'
import ListTable from '@/mixins/ListTable'

const listTableMixin = ListTable('products', { storeName: 'lists/products' })
// const listTableMixin = ListTable('products', { urlRoot: '/shopfront/product/' })

export default {
  name: 'Search',
  mixins: [
    listTableMixin  // 这个 mixin 会定义一个叫 products 的 computed 对象
  ],
  components: {
    CustomNav
  },
  data() {
    const { windowHeight, windowWidth, statusBarHeight } = this.$store.state.system
    const customNavHeight = statusBarHeight + 44
    const ratio = 375 / windowWidth  // 这个项目的设计尺寸是 375, Taro 那里也是配置了 375 为设计尺寸, 而不是默认的 750
    const topBarHeight = (customNavHeight + 35 + 40) / ratio  // 置顶分类和排序条
    const listHeight = windowHeight - topBarHeight
    const containerWidth = windowWidth - 2 * (5 / ratio)
    const topBottomPadding = (10 + 0) / ratio
    const leftRightPadding = (2 * 5) / ratio
    const textPadding = (5 + 5) / ratio
    const imageHeight = containerWidth / 2 - leftRightPadding
    const titleHeight = 20 / ratio
    const descHeight = 20 / ratio
    const priceHeight = 24 / ratio
    const itemHeight = topBottomPadding + imageHeight + titleHeight + descHeight + priceHeight + textPadding
    /* virtual-list 会根据 listHeight/itemHeight 判断首屏幕渲染几个 item */
    return {
      listHeight: listHeight,
      itemHeight: parseInt(itemHeight + 1),  // 最后加个1
      ProductItem,
      activeRootCategoryId: null,
      subCategoryDrawerVisible: false
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  computed: {
    ...mapState(['categories', 'system']),
    ...mapGetters('categories', [
      'getRootCategoryId'
    ]),
    statusBarHeight() {
      return _.get(this.system, 'statusBarHeight', 20)
    },
    customNavHeight() {
      return this.statusBarHeight + 44
    },
    customNavStyle () {
      return {
        'height': Taro.pxTransform(this.customNavHeight),
        'paddingTop': Taro.pxTransform(this.statusBarHeight + 3)
      }
    },
    homeBtnStyle() {
      return {
        'top': Taro.pxTransform(this.statusBarHeight + 3)
      }
    },
    pagePaddingTop() {
      return Taro.pxTransform(this.customNavHeight + 35 + 40)
    },
    categoriesBarTop() {
      return Taro.pxTransform(this.customNavHeight)
    },
    filtersBarTop() {
      return Taro.pxTransform(this.customNavHeight + 35)
    },
    subCategoriesWrapperTop() {
      return Taro.pxTransform(this.customNavHeight + 35 + 40)
    },
    listData() {
      return _.chunk(this.products.data, 2)
    },
    listLength() {
      // 向上取整
      return parseInt((this.products.data.length + 1) / 2)
    },
    activeSubCategories() {
      const category = _.find(this.categories.data, { id: this.activeRootCategoryId })
      return category ? category.children : []
    }
  },
  created() {},
  async mounted() {
    // 初始化过滤参数
    const defaultParams = {
      fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price', 'metafields'].join(',')
    }
    const filter = {}
    const { category } = getCurrentInstance().router.params
    filter.category = category
    // 因为要处理 activeCategory, 这里先 await 一下, categories 全局只取一次, 这样问题不大
    await this.$store.dispatch('categories/list')
    if (!filter.category) {
      // 默认一定要选中一个分类, 这个版本 search 页面不能显示全部商品, 之后再支持更多过滤
      filter.category = this.categories.data[0].id
    }
    this.$store.commit('lists/products/setParams', { filter, defaultParams })
    this.fetchProducts()
  },
  methods: {
    // listReachBottom() {},
    onScroll({ scrollDirection, scrollOffset }) {
      // console.log(scrollDirection, this.listHeight, scrollOffset, this.listLength * this.itemHeight)
      if (
        // 避免重复加载数据
        !this.products.pending &&
        // 只有往前滚动才触发
        scrollDirection === 'forward' &&
        // 100 = 滚动提前加载量
        this.listHeight + scrollOffset > (this.listLength * this.itemHeight - 100)
      ) {
        // this.listReachBottom()
        // this.fetchProducts({ more: true })
      }
    },
    filterRootCategory(categoryId) {
      // 虽然 fetchProducts 里面也会计算 activeRootCategoryId, 但这里早点设置也没事
      this.subCategoryDrawerVisible = false
      this.activeRootCategoryId = categoryId
      // 因为有 partial: false, 这里其实不需要专门把 q 重置为空, 为了避免混淆, 现在先这么保留着
      this.updateFilter({ q: '', category: categoryId }, { partial: false, fetch: false })
      this.fetchProducts()
    },
    filterSubCategory(categoryId) {
      this.subCategoryDrawerVisible = false
      // 因为有 partial: false, 这里其实不需要专门把 q 重置为空, 为了避免混淆, 现在先这么保留着
      this.updateFilter({ q: '', category: categoryId }, { partial: false, fetch: false })
      this.fetchProducts()
    },
    async fetchProducts({ more = false } = {}) {
      // fetchList 和 fetchMore 统一在这里调用, 因为调用前后还要处理各种 UI 元素
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        // TODO active category
        this.activeRootCategoryId = this.getRootCategoryId(this.products.filter.category)
        await this.fetchList()
      }
      Taro.hideNavigationBarLoading()
    },
    onClickOrderBy(orderBy) {
      if (this.products.orderBy === orderBy) {
        this.updateOrderBy('', { fetch: false })
      } else {
        this.updateOrderBy(orderBy, { fetch: false })
      }
      this.fetchProducts()
    },
    onSubmitSearch(q) {
      // 因为有 partial: false, 这里其实不需要专门把 category 重置为空, 为了避免混淆, 现在先这么保留着
      this.updateFilter({ q, category: '' }, { partial: false, fetch: false })
      this.fetchProducts()
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {
  // padding-top: 35px + 40px;  // inline 动态定义
  overflow: hidden;
  height: 100vh;
  :global(.virtual-list) {
    // padding-top: 5px;
  }
}
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
  position: fixed;
  z-index: $z-index-navbar - 1;
  padding: 15px;
  // top: 35px + 40px;  // inline 动态定义
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  // opacity: 0;
  visibility: hidden;
  transform: translate3d(0, -100%, 0);
  transition: all .1s ease-in-out;
  &:global(.is-visible) {
    // opacity: 1;
    visibility: visible;
    transform: translate3d(0, 0, 0);
  }
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
