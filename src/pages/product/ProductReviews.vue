<template>
  <view :class="$style['sectionInner']">
    <!-- Taro 是先用 vue 完全编译好输出节点再一次性填充到一个 wxml 模板里, 这里的 key 写法和 vue 一样 -->
      <view :class="$style['sectionHead']">
        <text :class="$style['sectionTitle']">{{ sectionTitle || '评论' }}（{{reviewTotalCount}}）</text>
        <navigator
          v-if="reviewTotalCount > 0"
          :class="$style['reviewsMore']"
          :url="`/pages/product/reviews/index?product=${productId}`">查看全部</navigator>
      </view>
      <view :class="$style['sectionContainer']">
        <navigator
          v-if="reviewTotalCount === 0"
          :url="`/pages/product/reviews/post?product=${ productId }`"
          :class="$style['navigatorNew']">
          <image
            :class="$style['navigatorNewIcon']"
            src="https://up.img.heidiancdn.com/o_1eeaarogl57i13djipg1r8c13k0hape3x.png"
            mode="aspectFill"></image>
          <text :class="$style['navigatorNewText']">添加一条评论</text>
        </navigator>
        <view v-else :class="$style['reviewItemWrapper']">
          <review-item
            :review="firstReviewData"
            :disableReply="true"
            :disableDownload="true"
          />
        </view>
      </view>
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

import ReviewItem from './reviews/ReviewItem'

/* 页面私有组件放在页面同一个目录下,
因为 taro 无法实现 vue 的 scoped css, 样式写在页面和组件里都可以, 注意 class 冲突就行 */
export default {
  name: 'ProductReviews',
  props: {
    sectionTitle: {
      tyoe: String,
      default: ''
    },
    productId: {
      type: [Number, String],
      default: () => {
        return ''
      }
    },
  },
  components: {
    ReviewItem
  },
  computed: {
    ...mapState('lists/reviews', {
      reviewTotalCount: (state) => state.reviewTotalCount,
      firstReviewPending: (state) => state.firstReviewPending,
      firstReviewData: (state) => state.firstReviewData
    }),
  },
  data() {
    return {}
  },
  mounted() {
    this.$store.dispatch('lists/reviews/getFirstReview', this.productId)
  },
  methods: {}
}
</script>

<style lang="scss" module>
@import './variables.scss';
.sectionInner {
  padding-left: 15px;
  padding-right: 15px;
  overflow: hidden;
}
.sectionHead {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px auto 10px;
}
.sectionTitle {
  font-weight: bold;
  color: $color-text;
  font-size: 16px;
}
.sectionContainer {
  margin: 10px auto;
}
.reviewsMore {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: $color-bg-light;
  &::after {
    content: "";
    position: relative;
    display: inline-block;
    width: 0;
    height: 0;
    top: 50%;
    margin-left: 2px;
    margin-top: -3px;
    border: 3px solid transparent;
    border-width: 3px 6px;
    border-left-color: $color-bg-light;
  }
}
.navigatorNew {
  margin-top: 10px;
  width: 100%;
  height: 34px;
  border-radius: 17px;
  background-color: $color-bg-grey;
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
  color: $color-light;
}
</style>
