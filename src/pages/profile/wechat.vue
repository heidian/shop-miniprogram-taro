<template>
  <view :class="$style['page']">
    <form class="form">
      <view class="form-item">
        <view class="label">微信号</view>
        <input class="input" v-model="formData.wechat_id" type="text" placeholder="请输入微信ID, 不是微信昵称" />
      </view>
    </form>
    <view :class="$style['buttonsWrapper']">
      <button :disabled="submitDisabled" class="button button--dark" @tap="submitForm">保存</button>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { handleErr } from '@/utils/errHelper'
import RequiresLogin from '@/mixins/RequiresLogin'

export default {
  name: 'Wechat',
  mixins: [ RequiresLogin ],
  data() {
    return {
      pending: false,
      formData: {}
    }
  },
  computed: {
    ...mapState(['partnerProfile']),
    submitDisabled() {
      return !this.formData.wechat_id
    }
  },
  mounted() {
    const { wechat_id } = _.cloneDeep(this.partnerProfile.data)
    this.formData = {
      wechat_id
    }
  },
  methods: {
    submitForm() {
      if (this.pending) return
      this.$store.dispatch('partnerProfile/update', this.formData).then(data => {
        this.pending = false
        Taro.showToast({ title: '更新成功' })
      }).catch(err => {
        this.pending = false
        handleErr(err)
      })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';

page {
  background-color: $color-bg-gray;
}
.buttonsWrapper {
  position: fixed;
  z-index: $z-index-footer;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 20px;
  :global(.button) {
    display: block;
  }
}
</style>
