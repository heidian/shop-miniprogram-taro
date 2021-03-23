<template>
  <view class="block--tezign-banner" :style="css">
    <navigator hover-class="none" :url="url" :open-type="openType">
      <image class="image" :src="optimizeImage(image)" mode="widthFix"></image>
    </navigator>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'
import { parseUrl } from '@/utils/url'
import { mapState } from 'vuex'

export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        image: {},
        url: ''
      })
    }
  },
  data() {
    return {
      url: '',
      openType: '',
      image: { src: '' },
    }
  },
  computed: {
    ...mapState('customer', {
      isAuthenticated: (state) => state.isAuthenticated,
      mobile: (state) => state.data.mobile
    }),
  },
  created() {
    if (this.mobile) {
      this.getBanner(this.mobile)
    } else if (!this.isAuthenticated) {
      Taro.reLaunch({ url: '/pages/login/index' })
    }
  },
  methods: {
    optimizeImage,
    setImageAndUrl(image, url) {
      const parse = parseUrl(url)
      this.url = parse.url
      this.openType = parse.openType
      this.image = image
    },
    getBanner(mobile) {
      if (mobile) {
        API.get('/clients/tezign/banner/', {
          params: { mobile }
        }).then(({ data }) => {
          this.setImageAndUrl(data.image, data.url)
        }).catch((err) => {
          console.log(err)
          this.setImageAndUrl(this.settingsData.image, this.settingsData.url)
        })
      }
    }
  },
  watch: {
    mobile(newVal) {
      this.getBanner(newVal)
    }
  }
}
</script>

<style lang="scss">
.block--tezign-banner {
  .image {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
