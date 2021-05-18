<template>
  <view :class="$style['sectionInner']" :style="sectionStyle">
    <view :class="$style['sectionHead']">
      <text :class="$style['sectionTitle']">用户评价</text>
    </view>
    <view :class="$style['sectionContainer']">
      <navigator
        v-if="reviewTotalCount === 0"
        :url="`/pages/product/reviews-fitting/post?product=${product.id}`"
        :class="$style['navigatorNew']"
      >
        <image
          :class="$style['navigatorNewIcon']"
          src="https://up.img.heidiancdn.com/o_1eeaarogl57i13djipg1r8c13k0hape3x.png"
          mode="aspectFill"
        ></image>
        <text :class="$style['navigatorNewText']">添加一条评论</text>
      </navigator>
      <view v-else :class="$style['reviewItemWrapper']">
        <review-item
          :review="firstReviewData"
          :productId="product.id"
          :disableReply="true"
          :disableDownload="true"
        ></review-item>
      </view>
    </view>
    <view :class="$style['sectionFooter']">
      <navigator
        class="button button--primary button--small"
        :class="$style['btnMore']"
        :url="`/pages/product/reviews-fitting/index?product=${product.id}`"
      >探索更多</navigator>
    </view>
    <!-- 闭合标签尽量和文本内容紧贴, 避免出现前后空格, 内部元素是标签就随意 -->
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

import ReviewItem from '../../../pages/product/reviews-fitting/ReviewItem'

/* 页面私有组件放在页面同一个目录下,
因为 taro 无法实现 vue 的 scoped css, 样式写在页面和组件里都可以, 注意 class 冲突就行 */
export default {
  name: 'JoyberryProductSingleReviews',
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    },
    product: {
      type: Object,
      required: true
    },
  },
  components: {
    ReviewItem
  },
  computed: {
    ...mapState('lists/reviews', {
      reviewTotalCount: (state) => state.count,
      firstReviewPending: (state) => state.pending,
      firstReviewData: (state) => state.data[0]
    }),
    sectionStyle() {
      return this.reviewTotalCount === 0 ? {
        ...this.css,
        display: 'none'
      } : this.css
    }
  },
  data() {
    return {}
  },
  async mounted() {
    // this.$store.dispatch('lists/reviews/getFirstReview', this.product.id)
    const defaultParams = {
      product: this.product.id
    }
    this.$store.commit('lists/reviews/setParams', {
      defaultParams,
      pageSize: 1
    })
    await this.$store.dispatch('lists/reviews/list')
  },
  methods: {}
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.sectionInner {
  // padding-left: 15px;
  // padding-right: 15px;
  overflow: hidden;
}
.sectionHead {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid $color-divider;
}
.sectionTitle {
  width: 100%;
  font-weight: bold;
  color: $color-text;
  font-size: 15px;
  text-align: center;
}
.sectionContainer {
  margin: 10px auto;
}
.sectionFooter {
  text-align: center;
  padding-bottom: 40px;
}
.btnMore {
  width: 180px;
  border-radius: 0;
}
.navigatorNew {
  margin-top: 10px;
  width: 100%;
  height: 34px;
  border-radius: 17px;
  background-color: $color-bg-gray;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 15px;
}
.navigatorNewIcon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
.navigatorNewText {
  font-size: 14px;
  color: $color-text-lighter;
}
</style>
