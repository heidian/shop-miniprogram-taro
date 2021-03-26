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
    <!-- 因为这个页面用了自定义 navbar, 需要修改 drawer 的样式 -->
    <drawer
      :visible.sync="subCategoryDrawerVisible"
      position="right" header="筛选" :style="filtersDrawerStyle"
    >
      <view :class="$style['drawerFilter']">
        <view :class="$style['filterSection']">
          <view :class="$style['filterTitle']">排序</view>
          <view :class="$style['filterBodyInline']">
            <view
              v-for="([title, field], index) in [
                ['新品', '-published_at'], ['价格', 'price'], ['销量', '-sold_quantity']
              ]" :key="index"
              :class="[$style['filterItem'], products.orderBy===field && 'is-active']"
              @tap="onClickOrderBy(field)"
            >{{ title }}</view>
          </view>
        </view>
        <!-- 二级分类 -->
        <view v-if="!!activeRootCategoryId" :class="$style['filterSection']">
          <view :class="$style['filterTitle']">分类</view>
          <view :class="$style['filterBody']">
            <view
              @tap="() => filterRootCategory(activeRootCategoryId)"
              :class="[$style['filterItem'], (activeRootCategoryId === +getFilter('category')) && 'is-active']"
            >全部</view>
            <view
              v-for="item in activeSubCategories" :key="item.id" @tap="() => filterSubCategory(item.id)"
              :class="[$style['filterItem'], (item.id === +getFilter('category')) && 'is-active']"
            >{{ item.title }}</view>
          </view>
        </view>
        <!-- 其他筛选条件 -->
        <view :class="$style['filterSection']">
          <view :class="$style['filterTitle']">面料</view>
          <view :class="$style['filterBody']">
            <view
              @tap="() => updateTagFilter('面料', '')"
              :class="[$style['filterItem'], (!getTagFilter('面料')) && 'is-active']"
            >全部</view>
            <view
              v-for="(item, index) in tagFilters['面料']" :key="index"
              @tap="() => updateTagFilter('面料', item)"
              :class="[$style['filterItem'], (item === getTagFilter('面料')) && 'is-active']"
            >{{ item }}</view>
          </view>
        </view>
        <view :class="$style['filterSection']">
          <view :class="$style['filterTitle']">颜色</view>
          <view :class="$style['filterBody']">
            <view
              @tap="() => updateTagFilter('颜色', '')"
              :class="[$style['filterItem'], (!getTagFilter('颜色')) && 'is-active']"
            >全部</view>
            <view
              v-for="(item, index) in tagFilters['颜色']" :key="index"
              @tap="() => updateTagFilter('颜色', item)"
              :class="[$style['filterItem'], (item === getTagFilter('颜色')) && 'is-active']"
            >{{ item }}</view>
          </view>
        </view>
      </view>
    </drawer>
    <floating-buttons>
      <floating-button-item @tap="subCategoryDrawerVisible = !subCategoryDrawerVisible">
        <text
          class="el-icon-s-operation"
          :class="{
            [$style['isDirty']]: activeRootCategoryId && +getFilter('category') !== activeRootCategoryId
          }"
        ></text>
      </floating-button-item>
    </floating-buttons>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import FloatingButtons from '@/components/FloatingButtons/FloatingButtons'
import FloatingButtonItem from '@/components/FloatingButtons/FloatingButtonItem'
import Drawer from '@/components/Drawer'

export default {
  components: {
    Drawer,
    FloatingButtons,
    FloatingButtonItem,
  },
  props: {
    products: {
      required: true,
      default: () => ({
        filter: {},
        orderBy: null,
        data: [],
      })
    },
    getFilter: {
      type: Function,
      required: true
    },
    updateFilter: {
      type: Function,
      required: true
    },
    updateOrderBy: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      activeRootCategoryId: null,
      subCategoryDrawerVisible: false,
      tagFilters: {
        '面料': ['面料A', '面料B', '面料C', '面料D', '面料E', '面料F'],
        '颜色': ['美人黑', '暮光蓝', '暮光红', '暮光白',],
      }
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
    filtersDrawerStyle() {
      const top = Taro.pxTransform(this.customNavHeight)
      return {
        'top': top,
        'bottom': '0px',
        'height': 'unset'
      }
    },
    activeSubCategories() {
      const category = _.find(this.categories.data, { id: this.activeRootCategoryId })
      return category ? category.children : []
    },
  },
  mounted() {
    this.activeRootCategoryId = this.getRootCategoryId(this.getFilter('category'))
  },
  methods: {
    filterRootCategory(categoryId) {
      this.subCategoryDrawerVisible = false
      // 虽然 updateFilter 以后再通过 watch 机制回来也会计算 activeRootCategoryId, 但这里早点设置也没事
      this.activeRootCategoryId = categoryId
      // 因为有 partial: false, 这里其实不需要专门把 q 重置为空, 为了避免混淆, 现在先这么保留着
      this.updateFilter({ q: '', category: categoryId }, { partial: false, fetch: true })
    },
    filterSubCategory(categoryId) {
      this.subCategoryDrawerVisible = false
      this.updateFilter({ category: categoryId }, { partial: true, fetch: true })
    },
    onClickOrderBy(orderBy) {
      this.subCategoryDrawerVisible = false
      if (this.products.orderBy === orderBy) {
        orderBy = ''
      }
      this.updateOrderBy(orderBy, { fetch: true })
    },
    getTagFilter(group) {
      // tag 都是 颜色:暮光蓝 这种格式的
      const tagKV = {}
      _.forEach(this.getFilter('tag', 'Array'), (tag) => {
        const [k, v] = tag.split(':')
        if (k && v) {
          tagKV[k] = v
        }
      })
      return tagKV[group] || ''
    },
    updateTagFilter(group, tag) {
      this.subCategoryDrawerVisible = false
      const tagKV = {}
      _.forEach(this.getFilter('tag', 'Array'), (tag) => {
        const [k, v] = tag.split(':')
        if (k && v) {
          tagKV[k] = v
        }
      })
      tagKV[group] = tag
      const tags = []
      _.forEach(tagKV, (v, k) => {
        if (k && v) {
          tags.push(`${k}:${v}`)
        }
      })
      this.updateFilter({
        tag: { value: tags, type: 'Array' }
      }, { partial: true, fetch: true })
    }
  },
  watch: {
    'products.filter': {
      handler: function(newVal) {
        this.activeRootCategoryId = this.getRootCategoryId(this.getFilter('category'))
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

.drawerFilter {
  overflow: hidden;
  background-color: #fff;
}
.filterSection {
  margin-bottom: 20px;
}
.filterTitle {
  font-size: 15px;
  line-height: 20px;
  padding: 0 15px;
}
.filterBody {
  padding: 5px 10px;
  .filterItem {
    padding: 5px;
    font-size: 13px;
    line-height: 16px;
    // color: $color-text-light;
    &:global(.is-active) {
      // color: $color-text;
      font-weight: bold;
    }
  }
}
.filterBodyInline {
  padding: 5px 5px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  .filterItem {
    padding: 4px 14px;
    margin: 5px;
    border: 1px solid transparent;
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
}
.isDirty {
  color: red;
}
</style>
