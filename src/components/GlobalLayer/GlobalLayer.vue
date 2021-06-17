<template>
  <view>
    <view v-if="notificationText" :class="$style['marqueWrapper']">
      <marquee :settingsData="{'content':notificationText}"></marquee>
    </view>
    <view
      v-if="popupImage && !popupClosed" @tap="closePopup"
      :class="$style['popupWrapper']"
    >
      <image
        :class="$style['pupupImage']" mode="widthFix"
        :src="optimizeImage(popupImage)"
        @tap.stop="onClickImage"
      ></image>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage } from '@/utils/image'
import { goToUrl } from '@/utils/url'
import Marquee from '@/components/blocks/Marquee'

export default {
  name: 'GlobalLayer',
  components: {
    Marquee
  },
  data() {
    return {
      popupClosed: true
    }
  },
  computed: {
    ...mapState('theme', ['themeSettingsData']),
    popupImage() {
      const image = _.get(this.themeSettingsData, 'globalPopupImage')
      if (image && image.src) {
        return image
      } else {
        return null
      }
    },
    notificationText() {
      const text = _.get(this.themeSettingsData, 'globalNotificationText')
      if (text && text.value) {
        return text
      } else {
        return null
      }
    }
  },
  mounted() {
    Taro.getStorage({
      key: '_popup_closed_at'
    }).then((res) => {
      const timestamp = (+res.data) || 0
      const now = (new Date()).valueOf()
      this.popupClosed = (now - timestamp) < 7 * 86400 * 1000
    }).catch(() => {
      this.popupClosed = false
    })
  },
  methods: {
    optimizeImage,
    onClickImage() {
      this.closePopup()
      const url = this.themeSettingsData.globalPopupUrl
      if (url) {
        goToUrl(url)
      }
    },
    closePopup() {
      this.popupClosed = true
      Taro.setStorage({
        key: '_popup_closed_at',
        data: (new Date()).valueOf()
      })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.marqueWrapper {
  position: fixed;
  z-index: $z-index-dialog;
  left: 0;
  top: 0;
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid $color-divider;
}
.popupWrapper {
  position: fixed;
  z-index: $z-index-dialog;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pupupImage {
  width: 60%;
  height: auto;
  display: block;
}
</style>
