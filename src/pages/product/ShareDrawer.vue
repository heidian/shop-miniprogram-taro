<template>
  <drawer-bottom
    :visible="isVisible" @close="onClose" @open="onOpen"
    header="分享" :class="$style['drawer']"
  >
    <view :class="$style['drawerBody']">
      <button :class="$style['item']" @tap="handleCopy">
        <view :class="[$style['icon'], 'el-icon-copy-document']"></view>
        <view>复制小程序路径</view>
      </button>
      <button :class="$style['item']" open-type="share" @tap="handleClose">
        <view :class="[$style['icon'], 'el-icon-share']"></view>
        <view>转发给好友</view>
      </button>
      <button :class="$style['item']" @tap="goToSharePage">
        <view :class="[$style['icon'], 'el-icon-picture-outline']"></view>
        <view>生成分享海报</view>
      </button>
    </view>
  </drawer-bottom>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import DrawerBottom from '@/components/DrawerBottom'

export default {
  name: 'ShareDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    productId: {
      type: Number,
      required: true
    }
  },
  components: {
    DrawerBottom
  },
  data() {
    return {
      isVisible: !!this.visible
    }
  },
  computed: {
    ...mapState(['customer'])
  },
  methods: {
    handleClose() {
      this.isVisible = false
      this.$emit('update:visible', false)
    },
    onClose() {
      this.$emit('update:visible', false)
    },
    onOpen() {
      this.$emit('update:visible', true)
    },
    handleCopy() {
      let shareScene = `r=pdt&id=${this.productId}`
      if (this.customer.isAuthenticated) {
        const referralCode = this.customer.data.referral_code
        shareScene += `&s=share&c=${referralCode}`
      }
      const path = `pages/home?scene=${encodeURIComponent(shareScene)}`
      Taro.setClipboardData({ data: path }).then(() => {
        Taro.showToast({ title: '复制成功' })
        this.handleClose()
      }).catch((err) => {
        Taro.showToast({ title: '复制失败' })
      })
    },
    goToSharePage() {
      this.handleClose()
      Taro.navigateTo({ url: `/pages/misc/share?product=${this.productId}` })
    }
  },
  watch: {
    visible(newValue) {
      this.isVisible = !!newValue
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.drawer {
  //
}
.drawerBody {
  padding: 40px 15px 50px;
  display: flex;
  align-items: flex-end;
  justify-content: space-evenly;
}
.item {
  flex: 1;
  text-align: center;
  font-size: 13px;
  line-height: 20px;
  border: 0;
  padding: 0;
  margin: 0;
  color: $color-text;
  background: transparent;
  &::after {
    display: none;
  }
}
.icon {
  display: block;
  text-align: center;
  font-size: 40px;
  line-height: 40px;
  margin-bottom: 10px;
}
</style>
