<template>
  <view :class="$style['page']">
    <form class="form">
      <view class="form-item">
        <view class="label">支付宝账号</view>
        <input class="input" v-model="formData.alipay" type="text" placeholder="请输入支付宝账号" />
      </view>
      <view class="form-item">
        <view class="label">姓名</view>
        <input class="input" v-model="formData.alipay_legal_name" type="text" placeholder="请输入支付宝的真实姓名" />
      </view>
    </form>
    <view :class="$style['addition']" @tap="checked=!checked">
      <checkbox :class="$style['checkbox']" :checked="checked"></checkbox>
      <text :class="$style['text']">请如实填写以上信息，并同意接受</text>
      <navigator :class="$style['navigator']" hover-class="none">《HeyShop支付相关协议》</navigator>
    </view>
    <view :class="$style['buttonsWrapper']">
      <button :disabled="submitDisabled" class="button--dark" @tap="submitForm">保存</button>
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
  name: 'Alipay',
  mixins: [ RequiresLogin ],
  data() {
    return {
      pending: false,
      formData: {},
      checked: false
    }
  },
  computed: {
    ...mapState(['partnerProfile']),
    submitDisabled () {
      return !this.formData.alipay || !this.formData.alipay_legal_name
    }
  },
  mounted() {
    const { alipay, alipay_legal_name } = _.cloneDeep(this.partnerProfile.data)
    this.formData = {
      alipay, alipay_legal_name
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
.addition {
  padding: 20px 15px 20px 45px;
  position: relative;
  color: $color-text-light;
  .navigator {
    display: inline;
  }
  .checkbox {
    position: absolute;
    top: 20px;
    left: 15px;
  }
}
.buttonsWrapper {
  position: fixed;
  z-index: $z-index-footer;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 20px;
  button {
    display: block;
  }
}
</style>
