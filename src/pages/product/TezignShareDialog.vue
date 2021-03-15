<template>
  <hs-dialog
    :class="$style['tezignShareDialog']"
    :visible.sync="dialogVisible" @close="onDialogClose" @open="onDialogOpen"
  >
    <image
      :class="$style['tezignShareImage']"
      mode="widthFix"
      :src="optimizeImage(imageSrc, { format: 'jpg' })"
    ></image>
    <button
      :class="['button', 'button--primary', 'button--small', 'button--round']"
      :disabled="pending" @tap="saveImage"
    >
      <template v-if="pending"><text class="el-icon-loading"></text> 正在保存</template>
      <template v-else>保存图片</template>
    </button>
  </hs-dialog>
</template>

<script>
import Taro from '@tarojs/taro'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import _ from 'lodash'
import HsDialog from '@/components/HsDialog'

export default {
  name: 'TezignShareDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      dialogVisible: false,
      // imageSrc: 'https://up.img.heidiancdn.com/o_1f0rc9lsa2j11m5s25d1tceeog0.png',
      pending: false,
    }
  },
  components: {
    HsDialog,
  },
  computed: {
    imageSrc() {
      return _.get(this.$store.state.theme, 'themeSettingsData.shareImageSrc') || 'https://up.img.heidiancdn.com/o_1f0rc9lsa2j11m5s25d1tceeog0.png'
    }
  },
  methods: {
    optimizeImage,
    onDialogClose() {
      this.$emit('update:visible', false)
      // this.$emit('close')  // 不需要传递事件
    },
    onDialogOpen() {
      this.$emit('update:visible', true)
      // this.$emit('open')  // 不需要传递事件
    },
    async saveImage() {
      this.pending = true
      try {
        const res = await Taro.downloadFile({ url: this.imageSrc })
        await Taro.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
        Taro.showModal({
          title: '海报已保存到相册',
          content: '快去分享到朋友圈, 免费领取特赞专享十二星座好礼吧!',
          showCancel: false,
        })
        this.dialogVisible = false
      } catch(err) {
        Taro.showModal({
          title: '海报保存失败',
          content: JSON.stringify(err),
          showCancel: false,
        })
      }
      this.pending = false
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.tezignShareDialog {
  :global(.dialog__body) {
    background-color: transparent;
  }
  .tezignShareImage {
    width: 60vw;
    margin-bottom: 20px;
  }
}
</style>
