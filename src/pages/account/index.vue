<template>
  <view :class="$style['page']" :style="$globalColors">
    <!-- 普通的跳转页面, 只需要 url 就行了 -->
    <view :class="$style['main']">
      <template v-if="customer.isAuthenticated">
        <image
          :class="$style['avatar']" mode="aspectFill"
          :src="optimizeImage(customer.data.avatar || DEFAULT_AVATAR, 50)"
        ></image>
        <navigator url="/pages/profile/edit" open-type="navigate" hover-class="none">
          <view :class="$style['fullName']">{{ customer.data.full_name || '未命名' }}</view>
        </navigator>
      </template>
      <template v-else>
        <image :class="$style['avatar']" mode="aspectFill" :src="DEFAULT_AVATAR"></image>
        <navigator url="/pages/login/index" :class="$style['loginLink']" hover-class="none">去登录</navigator>
      </template>
      <image
        v-if="customer.isAuthenticated && customer.data.mobile"
        src="https://up.img.heidiancdn.com/o_1cbbcvna21ardpe01d411d7bm9a0qrcode.svg"
        :class="$style['cardQrCode']"
        @tap="openQrModal"/>
    </view>
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
import HsDialog from '@/components/HsDialog'

export default {
  name: 'Account',
  components: {
    Price,
    HsDialog,
  },
  data() {
    return {
      DEFAULT_AVATAR,
      qrDialogVisible: false,
      customerQrcodeBase64: '',
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
    // Taro.setNavigationBarColor({
    //   frontColor: '#ffffff',
    //   backgroundColor: '#1a1a1a'
    // })
    // Taro.setBackgroundColor({
    //   backgroundColorTop: '#1a1a1a',
    //   backgroundColor: '#1a1a1a',
    //   backgroundColorBottom: '#f6f6f6',
    // })
  },
  computed: {
    ...mapState(['customer'])
  },
  mounted() {},
  onShow() {
    // 下面做了 throttle, 不会频繁获取
    if (this.customer.isAuthenticated) {
      this.throttleFetchCustomer()
    }
  },
  methods: {
    optimizeImage,
    throttleFetchCustomer: _.throttle(function() {
      // this.$store.dispatch('customer/getCustomer')  // 目前看起来不需要
    }, 5000, { leading: true, trailing: false }),
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
@import '@/styles/mixins';
$color-divider: rgba(#ffffff, 0.1);
.page {
  background-color: #f6f6f6;
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
  max-width: 100px;
  @include ellipsis();
}
.cardQrCode {
  width: 50px;
  height: 50px;
}
.loginLink {
  flex: 1;
  padding: 10px 0;
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
  padding-left: 3px;
}
.sectionHeadNavigator {
  display: flex;
  align-items: center;
  font-size: 12px;
}
.gridNavigatorDivider:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  right: 0;
  border-right: 1px solid $color-divider;
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
