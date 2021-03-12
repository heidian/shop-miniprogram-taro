<template>
  <view :class="$style['reviews']">
    <view :class="$style['container']">
      <review-item
        v-for="item in reviews.data"
        :key="item.id"
        :review="item"
        :productId="productId"
      />
    </view>
  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import ReviewItem from './ReviewItem'
import ListTable from '@/mixins/ListTable'

const listTableMixin = ListTable('reviews', { storeName: 'lists/reviews' })

export default {
  name: 'Reviews',
  components: {
    ReviewItem
  },
  mixins: [
    listTableMixin
  ],
  data() {
    /* getCurrentInstance 只在生命周期方法里用, 一般在 created() 或者 data() 方法里面用 */
    return {
      productId: null,
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
    const { product: productId } = getCurrentInstance().router.params
    this.productId = +productId
  },
  async mounted() {
    // 初始化过滤参数
    if (!this.productId) return
    const defaultParams = {
      product: this.productId
    }
    this.$store.commit('lists/reviews/setParams', {
      defaultParams,
      pageSize: 10
    })
    await this.fetchReviews()
  },
  computed: {},
  methods: {
    optimizeImage,
    backgroundImageUrl,
    /* 方法名称用驼峰 */
    async fetchReviews({ more = false } = {}) {
      // fetchList 和 fetchMore 统一在这里调用, 因为调用前后还要处理各种 UI 元素
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        await this.fetchList()
      }
      Taro.stopPullDownRefresh()
      Taro.hideNavigationBarLoading()
    },
  },
  onReachBottom() {
    const { data, page, pageSize, count } = this.reviews
    if (page * pageSize < count) {
      this.fetchMore()
    }
  },
  async onPullDownRefresh () {
    await this.fetchReviews()
  }
}

</script>

<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.reviews {
  min-height: 100vh;
  position: relative;
  padding-bottom: 30px;
}
.container {
  background-color: #ffffff;
}
</style>


