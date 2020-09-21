<template>
  <view :class="$style['page']">
    <view :class="$style['form']">
      <input v-model="referralCode" type="text" placeholder="请输入邀请码" />
      <button @tap="onSubmitReferralCode">确定</button>
    </view>
    <hs-dialog :visible.sync="dialogVisible">
      <view :class="$style['referralHeader']" slot="header">确认邀请人</view>
      <view :class="$style['referralBody']">
        <image :class="$style['referralAvatar']" :src="optimizeImage(referrerData.avatar, 100)"></image>
        <view :class="$style['referralName']">{{ referrerData.full_name }}</view>
        <view :class="$style['referralCodeText']">{{ referralCode }}</view>
      </view>
      <view :class="$style['referralFooter']" slot="footer">
        <button @tap="onCancel">取消</button>
        <button @tap="onConfirm">确定</button>
      </view>
    </hs-dialog>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentPages }from '@tarojs/taro'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'
import { optimizeImage } from '@/utils/image'
import HsDialog from '@/components/HsDialog'

export default {
  name: 'PartnerActivate',
  components: {
    HsDialog
  },
  data() {
    return {
      referrerData: {},
      dialogVisible: false,
      referralCode: ''
    }
  },
  computed: {
    //
  },
  methods: {
    optimizeImage,
    async getReferrerInfo () {
      try {
        const res = await API.get(`/customers/referrer/${this.referralCode}/`)
        this.referrerData = res.data
        this.dialogVisible = true
      } catch (err) {
        console.log(err)
        Taro.showModal({
          title: '出错了',
          content: '验证码已失效，请联系好友重新获取，或在下方选择一个带货达人',
          showCancel: false,
          success: function(res) {}
        })
      }
    },
    onSubmitReferralCode() {
      this.getReferrerInfo()
    },
    onCancel() {
      this.referralCode = ''
      this.dialogVisible = false
    },
    onConfirm() {
      this.dialogVisible = false
      this.handleActivate()
    },
    handleActivate() {
      API.post('/substores/partners/activate/', {
        referral_code: this.referralCode
      }).then(() => {
        //
      }).catch(handleErr)
    }
  }
}
</script>

<style lang="scss" module>
@import "@/styles/variables";
page {
  background-color: #020202;
}
.page {
  padding: 20px;
  color: rgba(#ffffff, 0.6);
}
.form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  input {
    display: block;
    width: 100%;
    flex: 1;
    border: solid 2px rgba(#ffffff, 0.6);
    line-height: 20px;
    padding: 10px;
    height: 44px;
  }
  button {
    border-radius: 0;
    margin-left: 10px;
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
    background-image: linear-gradient(126deg, #e8cca7, #edd6b8 55%, #e6caa5 87%);
  }
}
.referralHeader {
  width: 100%;
  padding: 30px 20px 10px;
  font-size: 18px;
  font-weight: 600;
  color: $color-text;
  text-align: center;
}
.referralBody {
  width: 100%;
  padding: 10px 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.referralAvatar {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
  border-radius: 30px;
}
.referralName {
  font-size: 15px;
  color: $color-text;
  font-weight: 600;
  margin-bottom: 10px;
}
.referralCodeText {
  font-size: 12px;
  color: $color-text-light;
}
.referralFooter {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-top: 1px solid $color-divider;
  button {
    flex: 1;
    border-radius: 0;
    background-color: transparent;
    & + button {
      border-left: 1px solid $color-divider;
      color: $color-orange;
    }
  }
}
</style>
