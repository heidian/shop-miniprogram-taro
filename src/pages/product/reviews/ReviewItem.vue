
<template>
  <view :class="$style['reviewItem']">
    <view :class="$style['avatar']" :style="{
      'backgroundImage': backgroundImageUrl(reviewCustomerAvatar, 100)
    }"></view>
    <view :class="$style['caption']">
      <view :class="$style['captionHead']">
        <view :class="$style['fullName']">{{ review.customer && review.customer.full_name || '未命名用户' }}</view>
        <view :class="$style['itemActions']">
          <navigator
            v-if="!disableReply"
            :url="`/pages/product/reviews/reply?review=${review.id}&product=${productId}`"
            :class="$style['action']"
            hover-class=“none”
          >
            <image
              :class="$style['actionIcon']"
              src="https://up.img.heidiancdn.com/o_1eea50d0f1f9obddflu1la3qbp0reply.png" mode="scaleToFill"
              :lazy-load="false">
            </image>
            <text :class="$style['actionText']">回复</text>
          </navigator>
        </view>
        <view :class="$style['itemCreatedAt']">{{ review.created_at|datetime }}</view>
      </view>
      <view :class="$style['content']">
        <text :class="$style['contentText']">{{ review.content }}</text>
        <template v-if="review.images && review.images.length">
          <scroll-view
            :scroll-x="true"
            :scroll-y="false"
            :class="$style['reviewItemImages']">
            <view v-for="(image, imgIndex) in review.images" :key="image.id" :class="$style['imageItem']">
              <image :src="optimizeImage(image, 100)" :class="$style['contentImage']" mode="aspectFill" @tap="() => onPreviewImage(imgIndex)"></image>
            </view>
          </scroll-view>
          <view v-if="!disableDownload" :class="$style['downloadAllImages']" @tap.stop="() => downloadAll(review.images)">下载全部图片</view>
        </template>
      </view>
      <view :class="$style['reviewItemreplies']" v-if="review.replies && review.replies.count">
        <view :class="$style['reviewItemReply']" v-for="reply in review.replies.results" :key="reply.id">
          <text :class="$style['replyFullname']">{{ reply.customer && reply.customer.full_name || '未命名用户' }}：</text>
          <text :class="$style['replyContent']">{{ reply.content }}</text>
        </view>
        <navigator
          v-if="review.replies.count > 1"
          :class="$style['reviewItemMore']"
          hover-class=“none”
          :url="`/pages/product/reviews/reply?review=${review.id}&product=${productId}`"
        >
          <text>共{{ review.replies.count }}条回复</text>
        </navigator>
      </view>
    </view>
  </view>
</template>
<script>
import Taro,{ showToast } from '@tarojs/taro'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

const downloadImageTask = (url, index) => {
  return new Promise((resolve, reject) => {
    // Taro.showLoading({ title: `正在下载第${index + 1}张` })
    const _downloadTask = Taro.downloadFile({ url }).then(res => {
      console.log(index, res.tempFilePath)
      Taro.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {  // 这里用回调的形式而不是用promise的形式，是因为在开发者工具里promise的写法可能会出现问题，6张图只能保存5张，而且没有报错
          // Taro.showLoading({ title: `第${index + 1}张下载完成` })
          resolve()
        },
        fail: () => {
          // Taro.showLoading({ title: `第${index + 1}张保存失败` })
          // reject(err)
          resolve()
        }
      })
    }).catch(err => {
      // Taro.showLoading({ title: `第${index + 1}张下载失败` })
      resolve()
    })
  })
}

const downloadTasks = (images) => {
  return _.map(images, (image, index) => {
    if (typeof image == 'object' && image.src) {
      return downloadImageTask(image.src, index)
    } else {
      return downloadImageTask(image, index)
    }
  })
}

export default {
  props: {
    productId: {
      type: [Number, String],
      default: ''
    },
    review: {
      type: Object,
      default: () => {
        return {}
      }
    },
    disableDownload: {
      type: Boolean,
      defaule: false
    },
    disableReply: {
      type: Boolean,
      defaule: false
    }
  },
  data () {
    return {

    }
  },
  computed: {
    reviewImages () {
      return _.get(this.review, 'images', [])
    },
    reviewCustomerAvatar () {
      return _.get(this.review, 'customer.avatar', 'https://up.img.heidiancdn.com/o_1dhf2esd81lde76c1rttgf31dm0oup23x.png')
    }
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    onPreviewImage (index=0) {
      const imageUrls = _.map(this.reviewImages || [], 'src')
      Taro.previewImage({
        current: imageUrls[index],
        urls: imageUrls
      })
    },
    onClickReply (id) {
      if (!id) {
        return
      }
      this.$emit('onClickReply', +id)
    },
    downloadAll (images) {
      Taro.showLoading({ title: '正在下载' })
      Promise.all(downloadTasks(images)).then(() => {
        Taro.hideLoading()
        Taro.showModal({
          title: '下载完成',
          content: '图片已保存至相册',
          showCancel: false
        })
      }).catch(err => {
        Taro.hideLoading()
        Taro.showModal({
          title: '下载出错',
          content: '请重试',
          showCancel: false
        })
      })
    }
  }
}
</script>

<style lang="scss" module>
@import '../variables.scss';
.reviewItem {
  width: 100%;
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
  position: relative;
  color: $color-text;
}
.reviewItem:not(:last-child) {
  border-bottom: solid 1px $color-border;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.caption {
  width: calc(100% - 40px);
  flex: 1;
  padding-left: 5px;
}
.captionHead {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
}
.fullName {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.7;
}
.itemActions {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}
.action {
  padding: 0;
  display: flex;
  align-items: center;
}
.actionIcon {
  width: 12px;
  height: 12px;
}
.actionText {
  margin-left: 3px;
  font-size: 10px;
  color: $color-light;
}
.itemCreatedAt {
  margin-top: 5px;
  width: 100%;
  font-size: 11px;
  color: $color-light;
}
.contentText {
  margin-top: 5px;
  font-size: 14px;
  line-height: 1.5;
  font-weight: normal;
  display: block;
  text-align: justify;
}
.reviewItemImages {
  margin-top: 5px;
  white-space: nowrap;
  overflow: auto;
  width: 100%;
  // display: flex;
  // flex-direction: row;
  // flex-wrap: nowrap;
  // justify-content: flex-start;
  // align-items: center;
}
.downloadAllImages {
  width: 80px;
  font-size: 10px;
  line-height: 16px;
  padding: 0 6px;
  color: $color-text;
  border: 1px solid;
  display: inline-block;
  margin-top: 8px;
}
.imageItem {
  display: inline-block;
  margin-left: 0;
  margin-right: 0;
  width: 80px;
  height: 80px;
  overflow: hidden;
}
.imageItem + .imageItem {
  margin-left: 8px;
}
.contentImage {
  width: 80px;
  height: 80px;
}
.reviewItemreplies {
  margin-top: 10px;
  position: relative;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 2px;
}
.reviewItemReply {
  width: 100%;
  margin-bottom: 5px;
  display: flex;
  align-items: baseline;
}
.replyFullname {
  font-weight: bold;
  font-size: 13px;
}
.replyContent {
  font-size: 13px;
}
.reviewItemMore {
  width: 100%;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: $color-light;
}
.reviewItemMore::after {
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
  border-left-color: $color-border;
}
</style>
