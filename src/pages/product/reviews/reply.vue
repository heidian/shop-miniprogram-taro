<template>
  <view :class="$style['reply']">
    <view :class="$style['replyCard']">
      <review-item :review="review" :disableReply="'1'" />
    </view>
    <view :class="$style['replyCard']" v-if="replies.length">
      <view :class="$style['cardHead']" style="font-size: 15px; margin-bottom: 15px;">全部回复（{{ replies.length }}）</view>
      <view :class="$style['repliesContainer']">
        <review-item v-for="item in replies" :key="item.id" :review="item" :disableReply="'1'" />
      </view>
    </view>
    <view :class="$style['replyFooter']">
      <input
        :class="$style['replyInput']"
        :value="content"
        @confirm="onSubmit"
        @input="onInput"
        confirm-type="send"
        placeholder="回复这条评论"></input>
    </view>
  </view>
</template>

<script>
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { uploadImage } from '@/utils/uploader'

import ReviewItem from '../ReviewItem'

export default {
  name: 'Reply',
  data () {
    const { product, review } = getCurrentInstance().router.params
    return {
      productId: product,
      reviewId: review,
      content: '',
      review: {},
      replies: [],
      loading: false,
      productTitle: '',
      pending: true,
    }
  },
  components: {
    ReviewItem
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  computed: {
    ...mapState(['clients'])
  },
  mounted () {
    this.fetchReviewData(this.reviewId)
    this.fetchReplies()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    onInput (e) {
      const content = e.detail.value || ''
      this.content = content
    },
    onSubmit () {
      const payload = {
        reply_to_id: this.reviewId,
        "owner_resource": "product",
        "owner_id": this.productId,
        "content": this.content || ''
      }
      this.pending = true
      API.post('/customers/review/', payload).then(res => {
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 1500, //延迟时间,
          mask: true,
        })
        this.content = ''
        this.pending = false
        // try {
        //   Taro.setStorageSync('_need_refresh_product_reviews', true)
        // } catch (error) {}
        this.fetchReplies(true)
      }).catch(err => {
        handleErr(err)
        this.pending = false
      })
    },
    fetchReviewData (reviewId) {
      if (!reviewId) return
      API.get(`/shopfront/review/${reviewId}/`).then(res => {
        const review = res.data || {}
        this.review = _.omit(review, 'replies')
      }).catch(err => {
        handleErr(err)
      })
    },
    fetchReplies (reset) {
      if (this.loading) return;
      this.loading = true
      API.get(`/shopfront/review/?reply_to=${this.reviewId}`).then(res => {
        const { results = [], next } =  res.data || {}
        const _replies = results
        this.replies = reset ? _replies : [
          ...(this.replies || []),
          ..._replies
        ]
        this.canFetch = !!next ? true : false
        this.loading = false
      })
    },
  },
  onReachBottom () {
    if (this.canFetch && !this.loading) {
      this.fetchReplies()
    }
  }
}
</script>
<style lang="scss" module>
@import '../variables.scss';
page {
  background-color: #f6f6f6;
}
.reply {
  min-height: 100vh;
  position: relative;
  padding-bottom: 80px;
}
.replyCard {
  background-color: #ffffff;
  position: relative;
  padding: 20px;
}
.replyCard + .replyCard {
  margin-top: 8px;
}
.cardHead {
  font-size: 17px;
  font-weight: 600;
  color: $color-dark;
}
.review-reply__content {
  margin-top: 20px;
}
.replyFooter {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 20px;
  background-color: #ffffff;
}
.replyInput {
  display: block;
  font-size: 14px;
  width: 100%;
  height: 34px;
  border-radius: 17px;
  background-color: #f6f6f6;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 15px;
}
</style>


