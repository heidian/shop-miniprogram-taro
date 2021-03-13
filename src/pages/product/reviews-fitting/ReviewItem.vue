
<template>
  <view :class="$style['reviewItem']">
    <view :class="$style['score']">
      <view v-for="i in [1,2,3,4,5]" :key="i"
            :class="[$style['ratingStar'], i <= scoreValue && $style['ratingStarActive']]"></view>
    </view>
    <view :class="$style['title']">{{ reviewContent['评价标题'] }}</view>
    <view :class="$style['fullName']">{{ reviewContent['姓名'] }}</view>
    <view :class="$style['createdAt']">{{ review.created_at|datetime('MM/DD/YYYY') }}</view>
    <view :class="$style['content']">{{ reviewContent['评价内容'] }}</view>
    <view style="font-weight: 600;">合身度</view>
    <view :class="$style['fitValue']">
      <slider
        :class="$style['slider']"
        :value="fitValue"
        :disabled="true"
        :min="0" :max="2" :step="1"
        backgroundColor="#272727"
        activeColor="#847CB4"
        :blockSize="14"
        blockColor="#847CB4"
        />
      <view :class="$style['sliderHints']">
        <text :class="$style['sliderHint']">宽松</text>
        <text :class="$style['sliderHint']">合身</text>
        <text :class="$style['sliderHint']">紧致</text>
      </view>
    </view>
    <view :class="$style['otherContent']">
      <view v-for="(value, label) in otherContent" :key="label" :class="$style['contentCol']">
        <view :class="$style['contentColLabel']">{{ label }}</view>
        <view :class="$style['contentColValue']">{{ value }}</view>
      </view>
    </view>
  </view>
</template>
<script>
import Taro,{ showToast } from '@tarojs/taro'
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
    },
    hideReplies: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      fitValueOptions: ['宽松', '合身', '紧致']
    }
  },
  computed: {
    reviewContent() {
      const contentList = _.split(_.get(this.review, 'content', ''), '\n')
      return _.fromPairs(_.map(contentList, item => {
        return _.split(item, '：')
      }))
    },
    scoreValue() {
      const score = _.get(this.reviewContent, '您的评分')
      return +score || 0
    },
    fitValue() {
      return _.findIndex(this.fitValueOptions, option => option === this.reviewContent['合身度'])
    },
    otherContent() {
      return _.pick(this.reviewContent, ['购买尺寸', '身高', '体重', '腰围', '臀围'])
    }

  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.reviewItem {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  color: $color-text;
}
.reviewItem:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-bottom: solid 1px $color-divider;
}

.score,
.title
.fullName
.createdAt
.content
.fitValue
.otherContent {
  width: 100%;
}
.score {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
}
.ratingStar {
  width: 20px;
  height: 20px;
  background: url('https://up.img.heidiancdn.com/o_1f0ioeg2h1i5a1p241kqslkd1bi20star.png') no-repeat center;
  background-size: 18px 18px;
  & + & {
    margin-left: 5px;
  }
  &.ratingStarActive {
    background-image: url('https://up.img.heidiancdn.com/o_1f0ioeg2fdmh1ba81nvhoon18ip0star1.png');
  }
}
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}
.fullName {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 25px;
}
.createdAt {
  margin-bottom: 10px;
}
.content {
  margin-bottom: 10px;
  text-align: justify;
}
.fitValue {
  height: auto;
  width: 100%;
  position: relative;
  margin-bottom: 25px;
  .slider {
    border-left: 2px solid #272727;
    border-right: 2px solid #272727;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1px;
      height: 18px;
      margin-top: -9px;
      border-left: 2px solid #272727;
    }
    margin-bottom: 15px;
  }

  .sliderHints {
    padding: 0 10px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sliderHint {
    font-size: 13px;
  }
}

.otherContent {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: nowrap;
  font-size: 12px;
}
.contentCol {
  // flex: 1;
  display: flex;
  flex-direction: column;
}
.contentColLabel {

}
.contentColValue {
  font-weight: bolder;
}
</style>
