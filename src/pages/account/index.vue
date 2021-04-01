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
      <!-- <image
        v-if="customer.isAuthenticated && customer.data.mobile"
        src="https://up.img.heidiancdn.com/o_1cbbcvna21ardpe01d411d7bm9a0qrcode.svg"
        :class="$style['cardQrCode']"
        @tap="openQrModal"
      ></image> -->
    </view>
    <view :class="$style['gridMenus']">
      <view :class="$style['gridMenusHeader']">
        <text>我的订单</text>
        <navigator
          style="font-size: 0.8em; opacity: 0.9;"
          open-type="navigate" hover-class="none" url="/pages/orders/index"
        >查看全部 <text class="el-icon-arrow-right"></text></navigator>
      </view>
      <view :class="$style['grid']">
        <navigator
          v-for="(item, index) in orderNavigators" :key="index"
          open-type="navigate" hover-class="none" :url="item.url"
          :class="$style['gridItem']"
        >
          <!-- <image :class="$style['gridItemIcon']" :src="item.icon" mode="aspectFit"></image> -->
          <text :class="[$style['gridItemIcon'], item.iconClass]"></text>
          <text :class="$style['gridItemText']">{{ item.text }}</text>
        </navigator>
      </view>
    </view>
    <view :class="$style['cellMenus']">
      <template v-for="item, index in cellNavigators">
        <button v-if="item.openType" :class="['button', $style['cellMenuItem']]" :key="index" :open-type="item.openType">
          <view :class="[$style['cellIcon'], item.iconClass]"></view>
          <view :class="$style['cellLabel']">{{ item.text }}</view>
          <view :class="[$style['cellArrow'], 'el-icon-arrow-right']"></view>
        </button>
        <navigator v-else :class="$style['cellMenuItem']" :key="index" :url="item.url" open-type="navigate">
          <view :class="[$style['cellIcon'], item.iconClass]"></view>
          <view :class="$style['cellLabel']">{{ item.text }}</view>
          <view :class="[$style['cellArrow'], 'el-icon-arrow-right']"></view>
        </navigator>
      </template>
    </view>
    <view :class="$style['buttonWrapper']" v-if="customer.isAuthenticated">
      <button class="button" type="warn" @tap="handleLogout">登出</button>
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
        url: '/pages/orders/index?filter=unpaid', iconClass: 'el-icon-time', text: '待付款'
      }, {
        url: '/pages/orders/index?filter=paid', iconClass: 'el-icon-wallet', text: '已付款'
      }, {
        url: '/pages/orders/index?filter=closed', iconClass: 'el-icon-circle-check', text: '已完成'
      }, {
        url: '/pages/orders/index?filter=cancelled', iconClass: 'el-icon-circle-close', text: '已取消'
      }],
      cellNavigators: [{
        url: '/pages/profile/edit', iconClass: 'el-icon-user', text: '个人信息'
      }, {
        url: '/pages/account/coupon-codes', iconClass: 'el-icon-collection-tag', text: '优惠券'
      }, {
        url: '/pages/addresses/index', iconClass: 'el-icon-location-outline', text: '收货地址'
      // }, {
      //   url: '/pages/account/favorites', iconClass: 'el-icon-star-off', text: '我的收藏'
      // }, {
      //   url: '/pages/account/settings', iconClass: 'el-icon-setting', text: '设置'
      }, {
        openType: 'contact', iconClass: 'el-icon-headset', text: '联系客服'
      }, {
        url: '/pages/static/index?name=about', iconClass: 'el-icon-goods', text: '关于我们'
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
    handleLogout () {
      this.$store.dispatch('customer/logout')
      Taro.reLaunch({ url: '/pages/account/index' })
    },
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
@import '@/styles/variables';
.page {
  background-color: #f6f6f6;
  min-height: 100vh;
}
.main {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  padding: 20px 15px 10px;
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

.gridMenus {
  background-color: #ffffff;
  margin: 10px auto;
  .gridMenusHeader {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 15px;
    // border-bottom: 1px solid $color-divider;
  }
  .grid {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px 20px;
  }
  .gridItem {
    text-align: center;
    + .gridItem::after {
      content: '';
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: 0;
      border-left: 1px solid $color-divider;
    }
  }
  .gridItemIcon {
    display: block;
    font-size: 20px;
    width: 20px;
    height: 20px;
    margin: 0 auto 15px;
  }
  .gridItemText {
    display: block;
    font-size: 13px;
    line-height: 1;
  }
}

.cellMenus {
  background-color: #fff;
  margin: 10px auto;
}
.cellMenuItem {
  background-color: transparent;
  margin-left: auto;
  margin-right: auto;
  outline: none;
  width: 100%;
  padding: 20px 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  line-height: 20px;
  // button::after 在 _buttons.scss 里被设成了 display: none
  // 如果这里改回 display: block 还得覆盖默认的样式, 不如直接用 before
  + .cellMenuItem::before {
    content: "";
    position: absolute;
    left: 15px;
    right: 15px;
    top: 0;
    border-top: 1px solid $color-divider;
  }
  .cellIcon {
    // margin-left: 5px;
    margin-right: 5px;
    font-size: 18px;
    opacity: 0.3;
  }
  .cellLabel {
    margin-left: 5px;
    // font-size: 15px;
    color: $color-text;
  }
  .cellArrow {
    width: 10px;
    height: 12px;
    opacity: 0.2;
    margin-left: auto;
  }
}

.buttonWrapper {
  width: 100%;
  padding: 15px;
  :global(.button) {
    display: block;
    width: 100%;
  }
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
