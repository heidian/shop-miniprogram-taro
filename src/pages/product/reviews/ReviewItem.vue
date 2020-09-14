
<template>
  <view :class="$style['reviewItem']">
    <view :class="$style['avatar']" :style="{
      'backgroundImage': backgroundImageUrl(reviewCustomerAvatar, 200)
    }"></view>
    <view :class="$style['caption']">
      <view :class="$style['captionHead']">
        <view :class="$style['fullName']">{{ review.customer && review.customer.full_name || '未命名用户' }}</view>
        <view :class="$style['itemActions']">
          <navigator
            v-if="!disableReply"
            :url="`/pages/product/reviews/reply?review=${review.id}&product=${productId}`"
            :class="$style['action']"
            :hover-class="'none'"
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
        <scroll-view
          v-if="review.images && review.images.length"
          :scroll-x="true"
          :scroll-y="false"
          :class="$style['reviewItemImages']">
          <view v-for="(image, imgIndex) in review.images" :key="image.id" :class="$style['imageItem']">
            <image :src="optimizeImage(image, 100)" :class="$style['contentImage']" mode="aspectFill" @tap="() => onPreviewImage(imgIndex)"></image>
          </view>
        </scroll-view>
      </view>
      <view :class="$style['reviewItemreplies']" v-if="review.replies && review.replies.count">
        <view :class="$style['reviewItemReply']" v-for="reply in review.replies.results" :key="reply.id">
          <text :class="$style['replyFullname']">{{ reply.customer && reply.customer.full_name || '未命名用户' }}：</text>
          <text :class="$style['replyContent']">{{ reply.content }}</text>
        </view>
        <navigator
          v-if="review.replies.count > 1"
          :class="$style['reviewItemMore']"
          :hover-class="'none'"
          :url="`/pages/product/reviews/reply?review=${review.id}&product=${productId}`"
        >
          <text>共{{ review.replies.count }}条回复</text>
        </navigator>
      </view>
    </view>
  </view>
</template>
<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

  export default {
    props: {
      productId: {
        type: [Number, String],
        default: ''
      },
      review: {
        type: Object,
        default: {}
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
        return _.get(this.review, 'customer.atavar', 'https://up.img.heidiancdn.com/o_1dhf2esd81lde76c1rttgf31dm0oup23x.png')
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
.imageItem {
  display: inline-block;
  margin-left: 0;
  margin-right: 0;
  width: 80px;
  height: 80px;
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
