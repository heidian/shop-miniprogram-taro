<template>
  <view :class="$style['postReview']">
    <view :class="$style['card']">
      <view :class="$style['cardHead']">{{ productTitle }}</view>
      <view :class="$style['cardContent']">
        <textarea
          :auto-focus="true"
          :class="$style['textarea']"
          placeholder="我要评论…"
          placeholder-style="color: #d8d8d8;"
          maxlength="-1"
          @input="onInput"
        />
      </view>
    </view>
    <view :class="$style['card']">
      <view :class="$style['cardHead']">添加图片</view>
      <view :class="[$style['grid'], $style['postReviewImages']]">
        <view v-for="(image, index) in images" :key="index" :class="[$style['gridItem'], $style['uploader']]">
          <view :style="{'backgroundImage': backgroundImageUrl(image, 120)}" :class="$style['postReviewimage']" @tap="() => onUpdateImages(index)"></view>
        </view>
        <view :class="[$style['gridItem'], $style['uploader']]" v-if="imagesLimit > images.length">
          <view :class="$style['uploaderDefault']" @tap="onUpdateImages"></view>
        </view>
      </view>
    </view>
    <view :class="$style['postReviewft']">
      <button
        class="button--round button--dark"
        :class="$style['submitBtn']"
        :disabled="!content || !!pending || !!uploading"
        @tap="onSubmit"
      >{{ pending ? '正在发布' : '发布' }}</button>
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

export default {
  name: 'Post',
  data () {
    const { product } = getCurrentInstance().router.params
    return {
      productId: product,
      productTitle: '',
      content: '',
      images: [],  // images 里面存的是 { src, metafield } 的格式
      uploading: false,
      pending: true,
      imagesLimit: 6
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  computed: {},
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
    onUpdateImages(idx) {
      if (this.uploading) {
        return
      }
      const shouldReplace = /\d+/.test(idx)
      const restCount = shouldReplace ? 1 : this.imagesLimit - (this.images.length || 0)
      if (!restCount) return;
      Taro.chooseImage({
        count: restCount,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      }).then(res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        if (res.tempFilePaths.length > this.imagesLimit) {
          Taro.showToast({ title: `图片最多上传${this.imagesLimit}张` })
          return
        }
        this.uploading = true
        const promiseList = _.map(res.tempFilePaths, tempFilePath => {
          return this.$store.dispatch('qiniu/uploadImage', tempFilePath)
        })
        Promise.all(promiseList).then((images) => {
          if (shouldReplace) {
            this.images[idx] = uploadImages[0] || ''
          } else {
            this.images = [ ...this.images, ...images ]
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
        'owner_resource': 'product',
        'owner_id': this.productId,
        'content': this.content || ''
      }
      if (this.images.length) {
        payload.images = [ ...this.images ]
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
.postReview {
  min-height: 100vh;
  position: relative;
  padding-bottom: 80px;
}
.card {
  background-color: $color-white;
  position: relative;
  padding: 20px;
}
.card + .card {
  margin-top: 8px;
}
.cardHead {
  font-size: 17px;
  font-weight: 600;
  color: $color-text;
}
.cardContent {
  margin-top: 20px;
}
.textarea {
  font-size: 14px;
  color: $color-text;
  line-height: 20px;
  width: 100%;
  height: 140px;
}
.postReviewImages {
  margin-top: 15px;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-left: -8px;
  margin-right: -8px;
  &::after {
    content: "";
    flex: auto;
  }
}
.gridItem {
  width: percentage(1/3);
  padding: 8px;
}
.uploader {
  position: relative;
}
.postReviewimage,
.uploaderDefault {
  width: 100%;
  padding-top: 100%;
  border-radius: 3px;
  background-color: $color-bg-grey;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  margin-left: auto;
  margin-right: auto;
}
.uploaderDefault {
  background-image: url('https://up.img.heidiancdn.com/o_1eecj635pib5jso1jbpu6c1q670path3x.png');
  background-size: 26px 26px;
}
.submitBtn {
  position: fixed;
  bottom: 30px;
  left: 50%;
  margin-left: -75px;
  width: 150px;
  // height: 40px;
  // border-radius: 20px;
  // box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.15);
  // background-color: $color-dark;
  // text-align: center;
  // padding: 0;
  // font-size: 14px;
  // font-weight: 600;
  // color: #ffffff;
  // line-height: 40px;
}
// .submitBtn[disabled] {
//   background-color: rgba($color-dark, 0.3) !important;
//   color: #ffffff !important;
// }
// .submitBtnHover {
//   background-color: rgba($color-dark, 0.8);
// }
</style>


