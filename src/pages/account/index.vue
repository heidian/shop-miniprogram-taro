<template>
  <view class="page page--account">
    <!-- 普通的跳转页面, 只需要 url 就行了 -->
    <view class="account__customer">
      <view class="account__customer__main">
        <image
          class="account__customer__avatar"
          mode="aspectFill"
          :src="customer.avatar || 'https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png?imageView2/2/w/360/ignore-error/1'"></image>
        <view class="account__customer__caption" v-if="isAuthenticated">
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
        <view v-else class="account__customer__caption">
          <navigator url="/pages/login/index" class="account__customer__login">登录</navigator>
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

    <template>

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

      <view class="account__grid account__promotion">
        <navigator
          v-for="item in promotionNavigators" :key="item.text"
          class="account__grid__item account__grid__navigator"
          open-type="navigate"
          hover-class="none">
          <image class="account__grid__item__icon account__grid__item__icon--bigger" :src="item.icon" mode="aspectFit"></image>
          <text class="account__grid__item__text">{{ item.text }}</text>
        </navigator>
      </view>

      <view class="account__section">
        <view class="account__section__head">
          <text class="account__section__head__title">我的订单</text>
          <navigator class="account__section__head__navigator" open-type="navigate" hover-class="none">
            <text>查看全部</text><view class="account__text__caret"></view>
          </navigator>
        </view>
        <view class="account__grid">
          <navigator
            v-for="item in orderNavigators" :key="item.text"
            class="account__grid__item account__grid__navigator account__grid__navigator--divider"
            open-type="navigate"
            hover-class="none">
            <image class="account__grid__item__icon" :src="item.icon" mode="aspectFit"></image>
            <text class="account__grid__item__text">{{ item.text }}</text>
          </navigator>
        </view>
      </view>

      <view class="account__section">
        <view class="account__section__head">
          <text class="account__section__head__title">我的功能</text>
        </view>
        <view class="account__grid">
          <navigator
            v-for="item in otherNavigators" :key="item.text"
            class="account__grid__item account__grid__navigator account__grid__navigator--divider"
            open-type="navigate"
            hover-class="none">
            <image class="account__grid__item__icon" :src="item.icon" mode="aspectFit"></image>
            <text class="account__grid__item__text">{{ item.text }}</text>
          </navigator>
        </view>
      </view>
    </template>

    <!-- <view class="account__auth-btns">
      <button v-if="isAuthenticated"  class="account__auth__btn account__auth__btn--red" @tap="logout">登出</button>
    </view> -->

    <!-- <infinite-products ref="infiniteProducts"></infinite-products> -->
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { handleErr } from '@/utils/errHelper'

// import InfiniteProducts from '@/components/InfiniteProducts/InfiniteProducts'

import './index.scss'

export default {
  name: 'Account',
  data() {
    return {
      pointsMax: 1000,
      promotionNavigators: [
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4kgtf1qm01d8a1hovm201gqe0up263x.png',
          text: '我的任务'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4kgtf1lha1tl75f7phcrp30enifit.png',
          text: '邀请返现'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4kgtf11k0p1qk31mha1qgb1rjf0awards.png',
          text: '粉丝排行榜'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4kgtf149j1sk5bih1rpk1rfb0.png',
          text: '推广帮助'
        }
      ],
      orderNavigators: [
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg17erq8ufi5un71lj50opay2x.png',
          text: '待付款'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg1ads6g21aba1bhn1e870paid2x.png',
          text: '已付款'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqf1112btg1f3jjdden0eled2x.png',
          text: '已取消'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg1mnck81cve1gf6asd0shed2x.png',
          text: '已完成'
        }
      ],
      otherNavigators: [
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqf1f1k1foe13541saq1o9e0hape2x.png',
          text: '优惠券'
        },
        {
          url: '',
          icon: '',
          text: '礼品卡'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqg1sv31rko9toam31q1m0hape2x.png',
          text: '收货地址'
        },
        {
          url: '',
          icon: 'https://up.img.heidiancdn.com/o_1eh4ipmqgbe6ker5eg12j31g560path2x.png',
          text: '我的收藏'
        }
      ]
    }
  },
  components: {
    // InfiniteProducts,
  },
  computed: {
    ...mapState('customer', {
      customer: (state) => state.data || {},
      isAuthenticated: (state) => state.isAuthenticated || false
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
    },
  },
  mounted () {
  },
  onShow () {
    this.$store.dispatch('customer/getCustomer')
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
  // onReachBottom() {
  //   this.$refs.infiniteProducts.onReachBottom()
  // },
}
</script>

<style lang="scss"></style>
