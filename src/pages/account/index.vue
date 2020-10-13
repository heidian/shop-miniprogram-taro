<template>
  <view :class="$style['page']">
    <!-- 普通的跳转页面, 只需要 url 就行了 -->
    <view :class="$style['darkMode']">
      <view :class="$style['main']">
        <template v-if="customer.isAuthenticated">
          <image
            :class="$style['avatar']" mode="aspectFill"
            :src="optimizeImage(customer.data.avatar || DEFAULT_AVATAR, 50)"
          ></image>
          <navigator url="/pages/account/settings" open-type="navigate" hover-class="none">
            <view :class="$style['fullName']">{{ customer.data.full_name || '未命名' }}</view>
            <view :class="$style['levelTitle']">
              <text class="el-icon-star-on"></text>{{ partnerProfile.data.level_title }}
            </view>
          </navigator>
        </template>
        <template v-else>
          <image :class="$style['avatar']" mode="aspectFill" :src="DEFAULT_AVATAR"></image>
          <navigator url="/pages/login/index" :class="$style['loginLink']" hover-class="none">去登录</navigator>
        </template>
        <image
          :class="$style['heyshop']" mode="widthFix"
          src="https://up.img.heidiancdn.com/o_1eiojj5s632c1urj1a6u1jn01l330shop3x.png"
        >HeyShop</image>
        <image
          v-if="customer.isAuthenticated && customer.data.mobile"
          src="https://up.img.heidiancdn.com/o_1cbbcvna21ardpe01d411d7bm9a0qrcode.svg"
          :class="$style['cardQrCode']"
          @tap="openQrModal"/>
      </view>
      <view :class="$style['partner']" v-if="!partnerLevel">
        <text :class="$style['partnerText']">成为国货大使获取收益</text>
        <navigator
          :class="$style['partnerBtnText']" hover-class="none"
          url="/pages/partner/index" open-type="switchTab"
        >立即升级</navigator>
      </view>
      <view :class="$style['balance']">
        <view :class="$style['balanceMain']">
          <navigator :class="$style['balanceValues']" url="/pages/partner/rebates" hover-class="none">
            <text :class="$style['balanceValuesLabel']">账户余额（元）</text>
            <price :class="$style['balanceValuesNumber']" :price="rebateSummary.balance"></price>
            <text :class="$style['balanceValuesHint']">自购返利{{ (+rebateSummary.summary.order_paid)|currency }} + 邀请收益{{ ((+rebateSummary.summary.referee_order_paid)+(+rebateSummary.summary.referral))|currency }}</text>
          </navigator>
          <view :class="$style['balanceBtns']">
            <!-- <view :class="$style['withdrawHistory']">提现记录 <text class="el-icon-arrow-right"></text></view> -->
            <navigator :class="$style['bindAlipay']" url="/pages/profile/alipay" open-type="navigate" hover-class="none">绑定支付宝</navigator>
          </view>
        </view>
        <view :class="$style['balanceDivider']"></view>
        <view :class="$style['balanceSummary']">
          <navigator :class="$style['balanceSummaryItem']" url="/pages/partner/rebates" hover-class="none">
            <view :class="$style['balanceSummaryLabel']">今日预估奖励</view>
            <price :class="$style['balanceSummaryValue']" :price="rebateSummary.total_today"></price>
          </navigator>
          <navigator :class="$style['balanceSummaryItem']" url="/pages/partner/rebates" hover-class="none">
            <view :class="$style['balanceSummaryLabel']">本月预估奖励</view>
            <price :class="$style['balanceSummaryValue']" :price="rebateSummary.total_this_month"></price>
          </navigator>
          <navigator :class="$style['balanceSummaryItem']" url="/pages/partner/referees" hover-class="none">
            <view :class="$style['balanceSummaryLabel']">已邀请粉丝</view>
            <view :class="$style['balanceSummaryValue']">{{ refereesCount }}</view>
          </navigator>
        </view>
      </view>
      <!-- <view :class="$style['section']">
        <view :class="$style['grid']">
          <navigator
            v-for="item in promotionNavigators" :key="item.text"
            :url="item.url" :open-type="item.openType" hover-class="none"
            :class="[$style['gridItem'], $style['gridNavigator']]"
          >
            <image :class="[$style['gridItemIcon'], $style['gridItemIconBigger']]" :src="item.icon" mode="aspectFit"></image>
            <text :class="$style['gridItemText']">{{ item.text }}</text>
          </navigator>
          <view :class="[$style['gridItem'], $style['gridNavigator']]" @tap="onTapInvite">
            <image
              :class="[$style['gridItemIcon'], $style['gridItemIconBigger']]"
              src='https://up.img.heidiancdn.com/o_1eh4kgtf1lha1tl75f7phcrp30enifit.png' mode="aspectFit"></image>
            <text :class="$style['gridItemText']">邀请返现</text>
          </view>
        </view>
      </view> -->
      <view :class="$style['section']">
        <view :class="$style['sectionHead']">
          <text :class="$style['sectionHeadTitle']">我的订单</text>
          <navigator
            :class="$style['sectionHeadNavigator']"
            open-type="navigate" hover-class="none" url="/pages/orders/index"
          >查看全部 <text class="el-icon-arrow-right"></text></navigator>
        </view>
        <view :class="$style['grid']">
          <navigator
            v-for="(item, index) in orderNavigators" :key="index"
            open-type="navigate" hover-class="none" :url="item.url"
            :class="[$style['gridItem'], $style['gridNavigator'], $style['gridNavigatorDivider']]"
          >
            <image :class="$style['gridItemIcon']" :src="item.icon" mode="aspectFit"></image>
            <text :class="$style['gridItemText']">{{ item.text }}</text>
          </navigator>
        </view>
      </view>
      <view :class="$style['section']">
        <view :class="$style['sectionHead']">
          <text :class="$style['sectionHeadTitle']">我的功能</text>
        </view>
        <view :class="$style['grid']">
          <navigator
            v-for="item in otherNavigators" :key="item.text"
            open-type="navigate" hover-class="none" :url="item.url"
            :class="[$style['gridItem'], $style['gridNavigator'], $style['gridNavigatorDivider']]"
          >
            <image :class="$style['gridItemIcon']" :src="item.icon" mode="aspectFit"></image>
            <text :class="$style['gridItemText']">{{ item.text }}</text>
          </navigator>
        </view>
      </view>
    </view>
    <view :class="$style['infiniteProducts']">
      <view :class="$style['infiniteProductsHead']">
        <image :class="$style['infiniteProductsLogo']" mode="aspectFill" :src="'https://up.img.heidiancdn.com/o_1eh71dvj035vlmd1251d2b14on0up412x.png'|imageUrl(400)"></image>
        <navigator :class="$style['infiniteProductsNavigator']" url="/pages/search/index" hover-class="none">
          <text :class="$style['infiniteProductsNavigatorText']">查看全部</text>
          <image :class="$style['infiniteProductsNavigatorArrow']" mode="aspectFit" src="https://up.img.heidiancdn.com/o_1eh71g4odmlspfo1ubjqc196a0copy2x.png"></image>
        </navigator>
      </view>
      <view :class="$style['infiniteProductsBody']">
        <infiniteProducts></infiniteProducts>
      </view>
    </view>
    <hs-dialog :visible.sync="qrDialogVisible">
      <view :class="$style['dialogHeader']" slot="header">会员扫码</view>
      <view :class="$style['dialogBody']">
        <image :class="$style['dialogQr']" :src="customerQrcodeBase64" mode="aspectFill"></image>
        <view :class="$style['dialogTips']">结算时请向店员出示此码</view>
      </view>
    </hs-dialog>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, DEFAULT_AVATAR } from '@/utils/image'
import { drawImg } from '@/utils/weapp-qrcode'
import { handleErr } from '@/utils/errHelper'
import Price from '@/components/Price'
import InfiniteProducts from '@/components/InfiniteProducts'
import HsDialog from '@/components/HsDialog'

export default {
  name: 'Account',
  components: {
    Price,
    InfiniteProducts,
    HsDialog,
  },
  data() {
    return {
      DEFAULT_AVATAR,
      qrDialogVisible: false,
      customerQrcodeBase64: '',
      refereesCount: 0,
      rebateSummary: {
        'summary': {
          'order_paid': '0.00',
          'referee_order_paid': '0.00',
          'referral': '0.00',
        },
        'balance': '0.00',
        'withdrawn': '0.00',
        'total_today': '0.00',
        'total_this_month': '0.00',
      },
      promotionNavigators: [{
        // url: '/pages/partner/index',
        // openType: 'switchTab',
        // icon: 'https://up.img.heidiancdn.com/o_1eh4kgtf1qm01d8a1hovm201gqe0up263x.png',
        // text: '我的任务'
        url: '/pages/account/coupon-codes',
        openType: 'navigate',
        icon: 'https://up.img.heidiancdn.com/o_1eitsdqi9bsv12p8h0nsija4f0coupon.png',
        text: '优惠券'
      }, {
        // url: '',
        // openType: 'navigate',
        // icon: 'https://up.img.heidiancdn.com/o_1eh4kgtf11k0p1qk31mha1qgb1rjf0awards.png',
        // text: '粉丝排行榜'
        url: '/pages/account/favorites',
        openType: 'navigate',
        icon: 'https://up.img.heidiancdn.com/o_1eitsdqi473olishfgt114rm0shlist.png',
        text: '我的收藏'
      }, {
        url: '/pages/partner/talent',
        openType: 'navigate',
        icon: 'https://up.img.heidiancdn.com/o_1eh4kgtf149j1sk5bih1rpk1rfb0.png',
        text: '推广帮助'
      }],
      orderNavigators: [{
        url: '/pages/orders/index?filter=unpaid',
        icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg17erq8ufi5un71lj50opay2x.png',
        text: '待付款'
      }, {
        url: '/pages/orders/index?filter=paid',
        icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg1ads6g21aba1bhn1e870paid2x.png',
        text: '已付款'
      }, {
        url: '/pages/orders/index?filter=closed',
        icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg1mnck81cve1gf6asd0shed2x.png',
        text: '已完成'
      }, {
        url: '/pages/orders/index?filter=cancelled',
        icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqf1112btg1f3jjdden0eled2x.png',
        text: '已取消'
      }],
      otherNavigators: [{
        url: '/pages/account/coupon-codes',
        icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqf1f1k1foe13541saq1o9e0hape2x.png',
        text: '优惠券'
      }, {
        url: '/pages/addresses/index',
        icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg1sv31rko9toam31q1m0hape2x.png',
        text: '收货地址'
      }, {
        url: '/pages/account/favorites',
        icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqgbe6ker5eg12j31g560path2x.png',
        text: '我的收藏'
      }, {
        url: '/pages/account/settings',
        icon: 'https://up.img.heidiancdn.com/o_1ekhnbg86slc5db7a82t13q10ttings.png',
        text: '设置'
      }]
    }
  },
  created() {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#1a1a1a'
    })
    Taro.setBackgroundColor({
      backgroundColorTop: '#1a1a1a',
      backgroundColor: '#1a1a1a',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  computed: {
    ...mapState(['customer', 'partnerProfile']),
    partnerLevel() {
      return +this.partnerProfile.data.level || 0
    }
  },
  mounted() {},
  onShow() {
    // 下面做了 throttle, 不会频繁获取
    if (this.customer.isAuthenticated) {
      this.throttleFetchRebates()
      this.throttleFetchCustomer()
      this.throttleFetchReferees()
    }
  },
  onReachBottom() {
    this.$store.dispatch('lists/infiniteProducts/listMore')
  },
  methods: {
    optimizeImage,
    onTapInvite () {
      if (this.partnerLevel > 0) {
        Taro.navigateTo({ url: '/pages/misc/share' })
      } else {
        Taro.showModal({
          title: '邀请返现',
          content: '快快升级为国货大使，解锁邀请返现、购物返利等更多福利吧！',
          showCancel: false
        }).then((res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/partner/index' })
          } else {}
        })
      }
    },
    throttleFetchRebates: _.throttle(function() {
      API.get('/substores/partners/rebate/summary/').then((res) => {
        this.rebateSummary = res.data
      }).catch((err) => {})
    }, 5000, { leading: true, trailing: false }),
    throttleFetchCustomer: _.throttle(function() {
      // this.$store.dispatch('customer/getCustomer')  // 目前看起来不需要
      this.$store.dispatch('partnerProfile/retrieve')
    }, 5000, { leading: true, trailing: false }),
    throttleFetchReferees: _.throttle(function() {
      API.get('/substores/partners/referee/', {
        params: { page_size: 1 }
      }).then((res) => {
        this.refereesCount = res.data.count
      }).catch((err) => {})
    }, 30000, { leading: true, trailing: false }),
    openQrModal() {
      const customerQrcodeBase64 = drawImg(this.customer.data.mobile, {
        typeNumber: 4,
        errorCorrectLevel: 'M',
        size: 200
      })
      if (customerQrcodeBase64) {
        this.customerQrcodeBase64 = customerQrcodeBase64
      }
      this.qrDialogVisible = true
    }
  }
}
</script>

<style lang="scss" module>
$color-bg: #1a1a1a;
$color-bg-light: #373737;
$color-bg-lighter: #f6f6f6;
$color-bg-dark: #000000;
$color-text: #ffffff;
$color-text-dark: #000000;
$color-text-light: rgba(#ffffff, 0.6);
$color-golden: #e7cba7;
$color-red: #e74c3c;
$color-bg-progress: #272727;
$color-brown: #5c411a;
$color-box-shadow: rgba(0, 0, 0, 0.2);
$color-divider: rgba(#ffffff, 0.1);

.page {
  //
}
.darkMode {
  background-color: $color-bg;
  color: $color-text;
  padding: 10px 20px 50px;
}
.main {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 30px;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  overflow: hidden;
}
.fullName {
  font-size: 15px;
  margin-bottom: 2px;
}
.levelTitle {
  font-size: 12px;
  color: $color-text-light;
}
.heyshop {
  width: 120px;
  height: auto;
  margin-left: auto;
  margin-right: 5px;
}
.cardQrCode {
  width: 50px;
  height: 50px;
}
.loginLink {
  flex: 1;
  padding: 10px 0;
}

/* partner */
.partner {
  width: 100%;
  height: 34px;
  margin-top: 15px;
  border-radius: 17px;
  background: linear-gradient(135deg, #020202 66.7%, $color-golden 33.3%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.partnerText {
  font-size: 15px;
  width: 64%;
  text-align: center;
  color: $color-golden;
  font-weight: normal;
}
.partnerBtnText {
  width: 32%;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: $color-brown;
}

/* balance */
.balance {
  margin-top: 15px;
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 4px 10px 0 $color-box-shadow;
  background-image: linear-gradient(126deg, $color-bg-light, $color-bg 87%);
  color: $color-text-light;
}
.balanceMain {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.balanceValues {
  display: flex;
  flex-direction: column;
  color: $color-text;
}
.balanceValuesLabel {
  font-size: 13px;
}
.balanceValuesNumber {
  font-size: 22px;
}
.balanceValuesHint {
  font-size: 10px;
}
.balanceBtns {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
}
.withdrawHistory {
  color: $color-text;
  font-size: 12px;
  display: flex;
  align-items: center;
}
.bindAlipay {
  margin-top: 20px;
  font-size: 14px;
  border-radius: 4px;
  background-color: $color-golden;
  color: $color-brown;
  width: 100px;
  height: 30px;
  line-height: 30px;
  padding: 0;
  text-align: center;
}

.balanceDivider {
  width: 100%;
  height: 0;
  border-top: 1px solid $color-divider;
  margin: 15px 0;
}

.balanceSummary {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.balanceSummaryItem {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.balanceSummaryLabel {
  font-size: 12px;
  line-height: 1;
  margin-bottom: 10px;
}
.balanceSummaryValue {
  font-size: 18px;
  color: $color-text;
  line-height: 1;
}
.grid {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.gridItem {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gridItemIcon {
  width: 20px;
  height: 20px;
  margin-bottom: 15px;
}
.gridItemIconBigger {
  width: 25px;
  height: 25px;
}
.gridItemText {
  font-size: 13px;
  line-height: 1;
  color: $color-text-light;
}
.section {
  margin-top: 45px;
}
.sectionHead {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 7px;
  border-bottom: 1px solid $color-divider;
  margin-bottom: 10px;
}
.sectionHeadTitle {
  font-size: 15px;
  font-weight: bold;
  color: $color-text;
  padding-left: 3px;
}
.sectionHeadNavigator {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: $color-text-light;
}
.gridNavigatorDivider:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  right: 0;
  border-right: 1px solid $color-divider;
}
.infiniteProducts {
  padding: 20px 0;
  background-color: $color-bg-lighter;
}
.infiniteProductsHead {
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.infiniteProductsLogo {
  width: 216px;
  height: 72px;
}
.infiniteProductsNavigator {
  display: flex;
  align-items: center;
}
.infiniteProductsNavigatorText {
  color: $color-text-dark;
  font-size: 12px;
  line-height: 22px;
  border-bottom: 1px solid;
}
.infiniteProductsNavigatorArrow {
  margin-left: 4px;
  width: 22px;
  height: 6px;
}

// qr dialog
.dialogHeader {
  width: 100%;
  padding: 30px 20px 10px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}
.dialogBody {
  width: 100%;
  padding: 10px 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.dialogQr {
  width: 200px;
  height: 200px;
}
.dialogTips {
  position: relative;
  overflow: visible;
  margin-top: 20px;
  color: #aaaaaa;
  &::before {
    display: block;
    content: "";
    position: absolute;
    left: -30px;
    top: 50%;
    width: 25px;
    height: 0;
    margin-top: -1px;
    border-top: 1px solid #aaaaaa;
  }
  &::after {
    display: block;
    content: "";
    position: absolute;
    right: -30px;
    top: 50%;
    width: 25px;
    height: 0;
    margin-top: -1px;
    // background-color: aqua;
    border-top: 1px solid #aaaaaa;
  }
}

</style>
