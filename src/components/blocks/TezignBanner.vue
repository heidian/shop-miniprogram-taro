<template>
  <view class="block--image" :style="css">
    <navigator hover-class="none" :url="url" :open-type="openType">
      <image class="image" :src="optimizeImage(image)" mode="widthFix"></image>
    </navigator>
  </view>
</template>

<script>
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'
import parseUrl from '@/utils/parseUrl'
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
      mobile: (state) => state.data.mobile
    }),
  },
  mounted() {
    this.getBanner()
  },
  methods: {
    optimizeImage,
    setImageAndUrl(image, url) {
      const parse = parseUrl(url)
      this.url = parse.url
      this.openType = parse.openType
      this.image = image
    },
    getBanner() {
      const mobile = this.mobile
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
      this.getBanner()
    }
  }
}
</script>

<style lang="scss">
.block--image {
  .image {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
