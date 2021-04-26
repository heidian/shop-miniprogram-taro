<template>
  <view>
    <view :class="$style['categoriesBar']" :style="{'top': categoriesBarTop}">
      <scroll-view
        :class="$style['categoriesScroll']"
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
      <!-- <view :class="$style['categoriesFilterButton']" @tap="subCategoryDrawerVisible = !subCategoryDrawerVisible">
        <text :class="{ 'is-dirty': isFiltersDirty }">筛选</text>
      </view> -->
    </view>

    <view
      v-if="activeRootCategoryImage"
      :class="$style['categoryImage']"
      :style="{'backgroundImage': backgroundImageUrl(activeRootCategoryImage, 400)}"
    ></view>
    <view :class="$style['fineTuningButtonsWrapper']">
      <view
        :class="[$style['fineTuningButtonsInner'], fixFineTuningOnTop && 'is-fixed']"
        :style="fixFineTuningOnTop ? { 'top': fineTuningBarTop } : {}"
      >
        <view
          :class="[$style['fineTuningButton'], isFiltersDirty && 'is-dirty']"
          @tap="subCategoryDrawerVisible = !subCategoryDrawerVisible"
        ><text class="el-icon-s-operation"></text> 筛选</view>
        <!-- <view
          :class="[$style['fineTuningButton'], (!!products.orderBy) && 'is-dirty']"
        ><text class="el-icon-sort"></text> 排序</view> -->
        <picker :class="$style['fineTuningButton']" mode="selector"
          @change="onPickOrderBy" :value="orderByIndex" :range="orderByOptions" range-key="title"
        >
          <view class="picker">
            <!-- {{ orderByOptions[orderByIndex].title }} -->
            <text class="el-icon-sort"></text> 排序
          </view>
        </picker>
      </view>
    </view>

    <!-- 因为这个页面用了自定义 navbar, 需要修改 drawer 的样式 -->
    <drawer
      :visible.sync="subCategoryDrawerVisible"
      position="right" header="筛选" :style="filtersDrawerStyle"
    >
      <view :class="$style['drawerFilter']">
        <!-- <view :class="$style['filterSection']">
          <view :class="$style['filterTitle']">排序</view>
          <view :class="$style['filterBodyPills']">
            <view
              v-for="([title, field], index) in [
                ['新品', '-published_at'], ['价格', 'price'], ['销量', '-sold_quantity']
              ]" :key="index"
              :class="[$style['filterItem'], products.orderBy===field && 'is-active']"
              @tap="onClickOrderBy(field)"
            >{{ title }}</view>
          </view>
        </view> -->
        <!-- 二级分类 -->
        <view v-if="!!activeRootCategoryId" :class="$style['filterSection']">
          <view :class="$style['filterTitle']">分类 (多选)</view>
          <view :class="$style['filterBodyRows']">
            <view
              @tap="() => filterRootCategory(activeRootCategoryId)"
              :class="[$style['filterItem'], (activeRootCategoryId === +getFilter('category')) && 'is-active']"
            >全部</view>
            <view
              v-for="item in activeSubCategories" :key="item.id" @tap="() => filterSubCategory(item.id)"
              :class="{
                [$style['filterItem']]: true,
                'is-active': (getFilter('category__in', 'CSV') || []).indexOf('' + item.id) >= 0
              }"
            >{{ item.title }}</view>
          </view>
        </view>
        <!-- 其他筛选条件 -->
        <view :class="$style['filterSection']" v-if="tagFilters['面料'] && tagFilters['面料'].length">
          <view :class="$style['filterTitle']">面料</view>
          <view :class="$style['filterBodyRows']">
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
        <view :class="$style['filterSection']" v-if="tagFilters['颜色'] && tagFilters['颜色'].length">
          <view :class="$style['filterTitle']">颜色</view>
          <view :class="$style['filterBodyImages']">
            <view
              @tap="() => updateTagFilter('颜色', '')"
              :class="[$style['filterItem'], (!getTagFilter('颜色')) && 'is-active']"
            >全部</view>
            <view
              v-for="(item, index) in tagFilters['颜色']" :key="index"
              @tap="() => updateTagFilter('颜色', item)"
              :class="[$style['filterItem'], 'has-image', (item === getTagFilter('颜色')) && 'is-active']"
              :style="{'backgroundImage': backgroundImageUrl(colorOptionImages[item])}"
            ></view>
          </view>
        </view>
      </view>
      <view slot="footer" :class="$style['drawerFilterFooter']">
        <button
          :class="['button', 'button--small']"
          @tap="updateFilter({}, { partial: false, fetch: true })"
        >重置</button>
        <button
          :class="['button', 'button--small', 'button--primary']"
          @tap="subCategoryDrawerVisible = false"
        >确定</button>
      </view>
    </drawer>
    <!-- <floating-buttons>
      <floating-button-item>
        <text class="el-icon-shopping-cart-2"></text>
      </floating-button-item>
      <floating-button-item @tap="subCategoryDrawerVisible = !subCategoryDrawerVisible">
        <text class="el-icon-s-operation" :class="{[$style['isDirty']]: isFiltersDirty}"></text>
      </floating-button-item>
    </floating-buttons> -->
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Drawer from '@/components/Drawer'
// import FloatingButtons from '@/components/FloatingButtons/FloatingButtons'
// import FloatingButtonItem from '@/components/FloatingButtons/FloatingButtonItem'

export default {
  components: {
    Drawer,
    // FloatingButtons,
    // FloatingButtonItem,
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
      fixFineTuningOnTop: false,
      // TODO 这部分只是给 joyberry 用的
      colorOptionTitle: '',
      colorOptionImages: {}, // { optionValue: imageSrc, ... }
      tagFilters: {
        '面料': [],
        '颜色': [],
      },
      orderByOptions: [
        { title: '新品', value: '-published_at' },
        { title: '价格', value: 'price' },
        { title: '销量', value: '-sold_quantity' }
      ],
      orderByIndex: 0,
    }
  },
  computed: {
    ...mapState(['categories', 'system']),
    ...mapState('theme', ['themeSettingsData']),
    customNavHeight() {
      return this.system.statusBarHeight + 44
      // return 0
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
    fineTuningBarTop() {
      // categoriesBar 高度是 35
      return Taro.pxTransform(this.customNavHeight + 35)
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
    activeRootCategoryImage() {
      const category = _.find(this.categories.data, { id: this.activeRootCategoryId })
      return _.get(category, 'image.src') ? category.image : null
    },
    isFiltersDirty() {
      return (
        !_.isEmpty(this.getFilter('category__in', 'CSV')) ||
        !_.isEmpty(this.getFilter('tag', 'Array'))
      )
    }
  },
  created() {
    this.getRootCategoryId()
    this.fetchTagFilters()
    this.configColorOptions()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    configColorOptions() {
      this.colorOptionTitle = _.get(this.themeSettingsData, 'colorOptionTitle.value') || ''
      const colorOptionImages = _.get(this.themeSettingsData, 'colorOptionImages') || []
      this.colorOptionImages = _.fromPairs(_.map(colorOptionImages, (image) => {
        return [_.get(image, 'metafield.altText') || '', image]
      }))
    },
    getRootCategoryId() {
      // this.activeRootCategoryId = this.getRootCategoryId(this.getFilter('category'))
      const getRootCategoryId = this.$store.getters['categories/getRootCategoryId']
      const category = this.getFilter('category')
      const categoryIn = this.getFilter('category__in', 'CSV') || []
      this.activeRootCategoryId = getRootCategoryId(category || categoryIn[0])
    },
    filterRootCategory(categoryId) {
      // this.subCategoryDrawerVisible = false
      // 虽然 updateFilter 以后再通过 watch 机制回来也会计算 activeRootCategoryId, 但这里早点设置也没事
      this.activeRootCategoryId = categoryId
      // 因为有 partial: false, 这里其实不需要专门把其他参数置为空
      this.updateFilter({ category: categoryId }, { partial: false, fetch: true })
    },
    filterSubCategory(categoryId) {
      // this.subCategoryDrawerVisible = false
      categoryId = '' + categoryId
      const categories = this.getFilter('category__in', 'CSV') || []
      const index = categories.indexOf(categoryId)
      if (index >= 0) {
        categories.splice(index, 1)
      } else {
        categories.push(categoryId)
      }
      if (categories.length) {
        this.updateFilter({
          'category__in': { value: categories, type: 'CSV' },
          'category': '',
        }, { partial: true, fetch: true })
      } else {
        this.updateFilter({
          'category__in': '',
          'category': this.activeRootCategoryId,
        }, { partial: true, fetch: true })
      }
    },
    onClickOrderBy(orderBy) {
      // this.subCategoryDrawerVisible = false
      if (this.products.orderBy === orderBy) {
        orderBy = ''
      }
      this.updateOrderBy(orderBy, { fetch: true })
    },
    onPickOrderBy(e) {
      this.orderByIndex = +e.detail.value
      const orderBy = _.get(this.orderByOptions[this.orderByIndex], 'value')
      this.updateOrderBy(orderBy, { fetch: true })
    },
    fetchTagFilters() {
      API.get('/shopfront/product_tag/', {
        params: { page_size: 999 }
      }).then(({ data }) => {
        _.forEach(data.results, (tag) => {
          const [title, value] = tag.title.split(':')
          if (title === '面料' || title === '颜色') {
            this.tagFilters[title].push(value)
          }
        })
      }).catch((err) => { console.log(err) })
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
      // this.subCategoryDrawerVisible = false
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
    },
    handlePageScroll(scrollTop) {
      Taro.pxTransform(this.customNavHeight)
      const imageHeight = this.activeRootCategoryImage ? (this.system.screenWidth - 16) / 3 + (8 + 10) : 10
      this.fixFineTuningOnTop = scrollTop >= imageHeight
    },
  },
  watch: {
    'themeSettingsData': {
      handler(newValue) {
        this.configColorOptions()
      },
      deep: true,
    },
    'products.filter': {
      handler: function(newVal) {
        this.getRootCategoryId()
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
  // padding-right: 60px;
}
.categoriesScroll {
  width: 100%;
  height: 100%;
}
// .categoriesFilterButton {
//   position: absolute;
//   right: 0;
//   top: 0;
//   width: 50px;
//   height: 100%;
//   // font-size: 20px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: $color-text-light;
//   :global(.is-dirty) {
//     color: $color-text;
//     font-weight: bold;
//   }
//   &::after {
//     position: absolute;
//     content: "";
//     left: 0;
//     top: 10px;
//     height: 15px;
//     border-left: 1px solid $color-divider;
//   }
// }
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

.categoryImage {
  display: block;
  margin: 8px;
  padding-top: 33.333333%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 4px;
}
.fineTuningButtonsWrapper {
  margin-top: 10px;
  height: 40px;
  .fineTuningButtonsInner {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    // background-color: rgba(#fff, 0);
    // transition: all .2s ease-in-out;
    &:global(.is-fixed) {
      position: fixed;
      z-index: $z-index-navbar;
      left: 0;
      width: 100%;
      background-color: rgba(#fff, 1);
    }
  }
  .fineTuningButton {
    padding: 6px 12px;
    &:global(.is-dirty) {
      font-weight: bold;
    }
  }
  :global([class^="el-icon-"]) {
    margin-right: 0.2em;
    font-size: 1.1em;
  }
}

.drawerFilter {
  overflow: hidden;
  padding: 5px 15px 30px;
}
.filterSection {}
.filterTitle {
  margin: 15px auto 5px;
}
.filterBodyRows {
  .filterItem {
    padding: 5px 5px 5px 15px;
    font-size: 13px;
    line-height: 20px;
    position: relative;
    &::after {
      content: "";
      position: absolute;
      left: -2px;
      top: 9px;
      width: 12px;
      height: 12px;
      border: 2px solid $color-text;
    }
    &:global(.is-active) {
      &::after {
        background-color: $color-text;
        box-shadow: inset 0 0 0 1px #fff
      }
      // font-weight: bold;
    }
  }
}
.filterBodyPills {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  margin-right: -10px;
  .filterItem {
    margin: 0 10px 10px 0;
    padding: 4px 14px;
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
.filterBodyImages {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  margin-right: -4px;
  .filterItem {
    margin: 0 4px 4px 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:global(.is-active) {
      &:global(.has-image) {
        border: 1px solid $color-text;
        box-shadow: inset 0 0 0 2px #ffffff;
      }
      font-weight: bold;
    }
  }
}
.drawerFilterFooter {
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  :global(.button) {
    flex: 1;
    + :global(.button) {
      margin-left: 5px;
    }
  }
}
</style>
