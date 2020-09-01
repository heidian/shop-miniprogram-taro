<template>
  <view class="page page--account">
    <!-- 普通的跳转页面, 只需要 url 就行了 -->
    <view class="account__customer">
      <view class="account__customer__main">
        <image
          class="account__customer__avatar"
          mode="aspectFill"
          :src="customer.avatar || 'https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png?imageView2/2/w/360/ignore-error/1'"></image>
        <view class="account__customer__caption">
          <view class="account__customer__caption__name">
            <text class="account__customer__full-name">{{ customer.full_name || '未命名' }}</text>
            <text class="account__customer__level__title">{{ levelTitle }}</text>
            <navigator class="account__customer__navigator--text" url="/pages/profile/index" open-type="navigate" hover-class="none">填写微信号</navigator>
          </view>
          <view class="account__customer__caption__referral">
            <text class="account__customer__referral-code">邀请ID：{{ customer.referral_code }}</text>
            <button class="account__customer__btn--copy-referral-code" @tap="onCopyToClipboard(customer.referral_code)">复制</button>
          </view>
        </view>
        <navigator class="account__customer__caret" url="/pages/profile/index" open-type="navigate" hover-class="none"></navigator>
      </view>
      <view class="account__customer__level-progress">
        <view class="account__customer__level__hint">
          <view class="account__customer__level__hint__text">当前成长值{{ points }}（达{{ pointsMax }}即可升级）</view>
          <view class="account__customer__level__hint__number">{{ points }}/{{ pointsMax }} <view class="account__text__caret"></view></view>
        </view>
        <view class="account__customer__level__progress">
          <view class="account__customer__level__progress__inner" :style="levelProgressStyle"></view>
        </view>
      </view>
    </view>

    <view class="account__partner">
      <text class="account__partner__text">成为合伙人获取收益</text>
      <text class="account__partner__btn__text">立即升级</text>
    </view>

    <view class="account__balance">
      <view class="account__balance__main">
        <view class="account__balance__values">
          <text class="account__balance__values__label">账户余额（元）</text>
          <text class="account__balance__values__number">{{ balance }}</text>
          <text class="account__balance__values__hint">自购返利￥0+邀请收益￥0</text>
        </view>
        <view class="account__balance__btns">
          <view class="account__balance__btns__withdraw-history">提现记录 <view class="account__text__caret"></view></view>
          <navigator class="account__balance__btns__bind-alipay" url="/pages/bind-alipay/index" open-type="navigate" hover-class="none">绑定支付宝</navigator>
        </view>
      </view>
      <view class="account__balance__divider"></view>
      <view class="account__balance__summary">
        <view class="account__balance__summary__item">
          <view class="account__balance__summary__item__label">今日预估奖励</view>
          <view class="account__balance__summary__item__value">0</view>
        </view>
        <view class="account__balance__summary__item">
          <view class="account__balance__summary__item__label">本月预估奖励</view>
          <view class="account__balance__summary__item__value">0</view>
        </view>
        <view class="account__balance__summary__item">
          <view class="account__balance__summary__item__label">已邀请粉丝</view>
          <view class="account__balance__summary__item__value">0</view>
        </view>
      </view>
    </view>
    <navigator
      target="self" open-type="navigate"
      url="/pages/login/index"
    >登录</navigator>
    <button type="default" @tap="logout">登出</button>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { handleErr } from '@/utils/errHelper'
import './index.scss'

export default {
  name: 'Account',
  data() {
    return {
      pointsMax: 1000
    }
  },
  computed: {
    ...mapState('customer', {
      customer: (state) => state.data || {}
    }),
    levelTitle () {
      return _.get(this.customer, 'level.title')
    },
    points () {
      return _.get(this.customer, 'points', 0)
    },
    levelProgressStyle () {
      const width = (this.points || 0) * 100 / this.pointsMax
      return {
        width: `${width}%`
      }
    },
    balance () {
      return '0.00'
    }
  },
  methods: {
    onCopyToClipboard (content) {
      if (!content) return
      Taro.setClipboardData({ data: content }).then(() => {
        Taro.showToast({ title: "复制成功" })
      }).catch(err => {
        handleErr(err)
      })
    },
    logout() {
      this.$store.dispatch('customer/logout')
    }
  },
  mounted () {
    this.$store.dispatch('customer/getCustomer')
  }
}
</script>

<style lang="scss"></style>
