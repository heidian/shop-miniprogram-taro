<template>
  <view>
    <view :class="$style['searchInputWrapper']">
      <text class="el-icon-search"></text>
      <input
        :class="$style['searchInput']" type="text" placeholder="搜索商品关键词"
        confirm-type="search" :value="getFilter('q')"
        @confirm="(e) => updateFilter({ q: e.detail.value }, { partial: false })"
      />
      <text class="el-icon-close" v-if="getFilter('q')" @tap="updateFilter({ q: '' }, { partial: false })"></text>
    </view>
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
    <drawer :visible.sync="subCategoryDrawerVisible" position="right" header="筛选" :style="filtersDrawerStyle">
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
        <view v-if="!!activeRootCategoryId && activeSubCategories.length" :class="$style['filterSection']">
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
        <view :class="$style['filterSection']" v-if="tagFilterOptions['颜色'] && tagFilterOptions['颜色'].length">
          <view :class="$style['filterTitle']">颜色</view>
          <view :class="$style['filterBodyImages']">
            <!-- <view
              @tap="() => resetTagFilter('颜色')"
              :class="[$style['filterItem'], (!tagFilterValues['颜色'].length) && 'is-active']"
            >全部</view> -->
            <view
              v-for="(tagValue, index) in tagFilterOptions['颜色']" :key="index"
              @tap="() => toggleTagFilter('颜色', tagValue)"
              :class="[$style['filterItem'], 'has-image', (tagFilterValues['颜色'].indexOf(tagValue) >= 0) && 'is-active']"
              :style="{'backgroundImage': backgroundImageUrl(colorOptionImages[tagValue])}"
            ></view>
          </view>
        </view>
        <view v-for="(tagValueOptions, tagGroup) in tagFilterOptions" :key="tagGroup" :class="$style['filterSection']">
          <template v-if="tagValueOptions.length && tagGroup !== '颜色'">
            <view :class="$style['filterTitle']">{{ tagGroup }}</view>
            <view :class="$style['filterBodyRows']">
              <!-- <view
                @tap="() => resetTagFilter(tagGroup)"
                :class="[$style['filterItem'], (!tagValueOptions) && 'is-active']"
              >全部</view> -->
              <view
                v-for="(tagValue, index) in tagValueOptions" :key="index"
                @tap="() => toggleTagFilter(tagGroup, tagValue)"
                :class="[$style['filterItem'], (tagFilterValues[tagGroup].indexOf(tagValue) >= 0) && 'is-active']"
              >{{ tagValue }}</view>
            </view>
          </template>
        </view>
      </view>
      <view slot="footer" :class="$style['drawerFilterFooter']">
        <button :class="['button', 'button--small']" @tap="clearFilters">重置</button>
        <button :class="['button', 'button--small', 'button--primary']" @tap="subCategoryDrawerVisible = false">确定</button>
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
      tagFilterOptions: {
        // tags 过滤选项
        '颜色': [],
        '场景': [],
        '面料': [],
        '支撑度': [],
      },
      tagFilterValues: {
        // products 参数中的 tags 过滤值
        '颜色': [],
        '场景': [],
        '面料': [],
        '支撑度': [],
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
      // return this.system.statusBarHeight + 44
      return 0
    },
    searchInputTop() {
      return Taro.pxTransform(this.customNavHeight)
    },
    categoriesBarTop() {
      // searchInput 高度是 40
      return Taro.pxTransform(this.customNavHeight + 40)
    },
    fineTuningBarTop() {
      // categoriesBar 高度是 35
      return Taro.pxTransform(this.customNavHeight + 40 + 35)
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
        !_.isEmpty(this.getFilter('tag__in', 'Array'))
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
          if (this.tagFilterOptions[title]) {
            // 只处理 tagFilterOptions 存在的 key
            this.tagFilterOptions[title].push(value)
          }
        })
      }).catch((err) => { console.log(err) })
    },
    inTagFilter(group, value) {
      const tag = `${group}:${value}`
      this.getFilter('tag__in', 'Array')
    },
    resetTagFilter(group) {
      this.tagFilterValues[group] = []
      this.submitTagFilters()
    },
    toggleTagFilter(group, tagValue) {
      const values = this.tagFilterValues[group]
      const index = values.indexOf(tagValue)
      if (index >= 0) {
        values.splice(index, 1)
      } else {
        values.push(tagValue)
      }
      this.submitTagFilters()
    },
    submitTagFilters() {
      // 把 tagFilterValues 的值更新到 store 里
      const tagIn = []
      _.forEach(this.tagFilterValues, (values, group) => {
        if (values.length) {
          const filterValue = _.map(values, (value) => `${group}:${value}`)
          tagIn.push(filterValue.join(','))
        }
      })
      this.updateFilter({
        tag__in: {
          value: tagIn.slice(0, 3),  // 只支持3项, 直接忽略更多的
          type: 'Array'
        }
      }, { partial: true, fetch: true })
    },
    clearFilters() {
      for (let key in this.tagFilterValues) {
        this.tagFilterValues[key] = []
      }
      this.updateFilter({}, { partial: false, fetch: true })
      this.subCategoryDrawerVisible = false
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
@import './SearchFilters.scss';
</style>
