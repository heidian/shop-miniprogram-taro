<template>
  <view class="reply">
    <view class="replyCard">
      <review-item :review="review" :disableReply="'1'" />
    </view>
    <view class="replyCard" v-if="replies.length">
      <view class="cardHead" style="font-size: 15px; margin-bottom: 15px;">全部回复（{{ replies.length }}）</view>
      <view class="repliesContainer">
        <review-item v-for="item in replies" :key="item.id" :review="item" :disableReply="'1'" />
      </view>
      <!-- <view class="" style="display: {{loading ? 'block': 'none'}}; width: 100vw; background-color: #fff;">
        <customloader backgroundColor.once="#F8F8F8">加载中</customloader>
      </view> -->
    </view>
    <view class="replyFooter">
      <input
        class="replyInput"
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
    const { product } = getCurrentInstance().router.params
    return {
      productId: product,
      productTitle: '',
      content: '',
      images: [],
      uploading: false,
      pending: true,
      imagesLimit: 6
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
    ...mapState(['clients']),
    uptoken () {
      return _.get(this.clients, 'uptoken', '')
    }
  },
  mounted () {
    this.fetchProductTitle()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    fetchProductTitle () {
      this.pending = true
      API.get(`/shopfront/product/${this.productId}/`, {
        params: {
          fields: 'title',
          page_size: 1
        }
      }).then(res => {
        const { title } =  res.data || {}
        this.productTitle = title
        this.pending = false
      }).catch(err => {
        this.pending = false
        handleErr(err)
      })
    },
    onInput (e) {
      const content = e.detail.value || ''
      this.content = content
    },
    onUpdateImages (idx) {
      if (!this.uptoken || !!this.uploading) {
        return
      }
      const should_replace = /\d+/.test(idx)
      const rest_count = should_replace ? 1 : this.imagesLimit - (this.images.length || 0)
      if (!rest_count) return;
      Taro.chooseImage({
        count: rest_count,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      }).then(res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        if (res.tempFilePaths.length > this.imagesLimit) {
          Taro.showToast({ title: `图片最多上传${this.imagesLimit}张` })
          return
        }
        this.uploading = true
        const promiseList = _.map(res.tempFilePaths || [], tempFilePath => uploadImage(tempFilePath, this.uptoken))
        Promise.all(promiseList).then((uploadResults) => {
          const uploadImages = _.map(uploadResults, 'link')
          if (should_replace) {
            this.images[ idx ] = uploadImages[0] || ''
          } else {
            this.images = [
              ...this.images,
              ...uploadImages
            ]
          }
          this.uploading = false
        }).catch(err => {
          this.uploading = false
          handleErr(err)
        })
      })
    },
    onSubmit () {
      const payload = {
        "owner_resource": "product",
        "owner_id": this.productId,
        "content": this.content || ''
      }
      if (this.images.length) {
        payload.images = _.map(this.images, image => {
          return {
            src: image,
            metafield: {}
          }
        })
      }
      this.pending = true
      API.post('/customers/review/', payload).then(res => {
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 1500, //延迟时间,
          mask: true,
        })
        this.pending = false
        try {
          Taro.setStorageSync('_need_refresh_product_reviews', true)
        } catch (error) {}

        _.delay(() => {
          Taro.navigateBack({
            delta: 1
          })
        }, 1500)
      }).catch(err => {
        handleErr(err)
        this.pending = false
      })
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


