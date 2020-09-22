<template>
  <view :class="$style['page']">
    <view :class="$style['form']">
      <input v-model="referralCode" type="text" placeholder="请输入邀请码" />
      <button @tap="onSubmitReferralCode">确定</button>
    </view>
    <view :class="$style['tips']">邀请码可向你的HeyShop小程序推荐者索取获得，或者也可以选择一位我们推荐的优质带货达人作为你的邀请人，加入TA的团队一起玩转带货。</view>
    <view :class="$style['featured']" v-if="featuredReferrals && featuredReferrals.length">

      <view :class="$style['featuredTitle']">
        <view :class="$style['featuredTitleDeco']"></view>
        <text :class="$style['featuredTitleText']">推荐带货达人</text>
        <view :class="$style['featuredTitleDeco']"></view>
      </view>
      <!-- <view :class="$style['featuredSteps']">
        <view :class="$style['step']">
          <view :class="$style['stepIcon']"
            :style="{'backgroundImage': backgroundImageUrl('https://up.img.heidiancdn.com/o_1eiq9i13o18os51n185n97eisr0oup82x.png', 50)}"></view>
          <text :class="$style['stepText']">1.确定邀请人</text>
        </view>
        <view :class="$style['stepDivider']">---</view>
        <view :class="$style['step']">
          <view :class="$style['stepIcon']"
            :style="{'backgroundImage': backgroundImageUrl('https://up.img.heidiancdn.com/o_1eiq9i13ov19sct70c7gl19490oup92x.png', 50)}"></view>
          <text :class="$style['stepText']">2.添加微信</text>
        </view>
        <view :class="$style['stepDivider']">---</view>
        <view :class="$style['step']">
          <view :class="$style['stepIcon']"
            :style="{'backgroundImage': backgroundImageUrl('https://up.img.heidiancdn.com/o_1eiq9i13o1s6nitd1va25ihcmj0up102x.png', 50)}"></image>
          <text :class="$style['stepText']">3.获取专属指导</text>
        </view>
      </view> -->
      <image :class="$style['steps']" :src="optimizeImage('https://up.img.heidiancdn.com/o_1eiqb43ip18dh80os5q8t7m460img.png', 200)" mode="heightFix"></image>

      <view :class="$style['referrals']">
        <view v-for="item in featuredReferrals" :key="item.id" :class="$style['card']" >
          <image :class="$style['cardAvatar']" :src="optimizeImage(item.avatar || DEFAULT_AVATAR)" mode="aspectFill"></image>
          <text :class="$style['cardTitle']">{{ item.full_name }}</text>
          <text :class="$style['cardBiography']">{{ item.biography }}</text>
          <button :class="['button--small', 'button--dark', 'button--round', $style['cardBtn']]" @tap="() => pickReferral(item.referral_code)">选TA</button>
        </view>
      </view>
    </view>
    <hs-dialog :visible.sync="dialogVisible">
      <view :class="$style['referralHeader']" slot="header">确认邀请人</view>
      <view :class="$style['referralBody']">
        <image :class="$style['referralAvatar']" :src="optimizeImage(referrerData.avatar, 100)"></image>
        <view :class="$style['referralName']">{{ referrerData.full_name }}</view>
        <view :class="$style['referralCodeText']">邀请码：{{ referralCode }}</view>
        <view :class="$style['referralTip']">邀请人确定后将不可更改，是否确定？</view>
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
import { optimizeImage, backgroundImageUrl, DEFAULT_AVATAR } from '@/utils/image'
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
      referralCode: '',
      featuredReferrals: [],
      DEFAULT_AVATAR
    }
  },
  computed: {
    //
  },
  mounted() {
    this.getFeaturedReferrers()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
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
    async getFeaturedReferrers () {
      try {
        const res = await API.get(`/substores/partners/talent/`, {
          params: {
            page_size: 5
          }
        })
        const { results = [] } = res.data
        this.featuredReferrals = results
      } catch (err) {
        console.log(err)
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
        Taro.showToast({ title: '合伙人身份激活成功', icon: 'none', duration: 1000 })
        this.$store.dispatch('partnerProfile/retrieve')
        setTimeout(() => Taro.navigateBack(), 1000)
      }).catch(handleErr)
    },
    pickReferral (code) {
      this.referralCode = code
    }
  }
}
</script>

<style lang="scss" module>
@import "@/styles/variables";
$color-white: #ffffff;
$color-golden: #e7cba7;
$color-border: rgba($color-white, 0.3);
$color-card-bg: #ffffff;

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
.referralTip {
  margin-top: 15px;
  color: $color-text-lighter;
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

.tips {
  font-size: 12px;
  text-align: justify;
  line-height: 16px;
  margin-top: 10px;
  color: $color-text-lighter;
}

.featured {
  margin-top: 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.featuredTitle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.featuredTitleText {
  font-size: 13px;
  color: $color-white;
  margin: 0 15px;
}
.featuredTitleDeco {
  display: inline-block;
  width: 110px;
  height: 0;
  border-top: 1px solid $color-border;
}
// .featuredSteps {
//   margin-top: 15px;
//   width: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: flex-start;
//   background-repeat: no-repeat;
// }
.steps {
  margin-top: 10px;
  width: 100%;
  height: 75px;
}
.referrals {
  width: 100%;
  padding: 30px;
}
.card {
  width: 100%;
  background-color: $color-card-bg;
  border-radius: 10px;
  padding: 30px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  & + & {
    margin-top: 40px;
  }
}
.cardAvatar {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 10px;
}
.cardTitle {
  color: $color-text;
  font-size: 17px;
  margin-bottom: 15px;
  font-weight: 600;
}
.cardBiography {
  font-size: 14px;
  color: $color-text;
  min-height: 100px;
}
.cardBtn {
  margin-top: 20px;
  min-width: 100px;;
}
</style>
