<template>
  <view class="page page--account">
    <!-- 普通的跳转页面, 只需要 url 就行了 -->
    <view class="account__customer">
      <image
        class="account__customer__avatar"
        mode="aspectFill"
        :src="customer.avatar || 'https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png?imageView2/2/w/360/ignore-error/1'"></image>
      <view class="account__customer__caption">
        <view class="account__customer__caption__name">
          <text class="account__customer__full-name">{{ customer.full_name || '未命名' }}</text>
          <text class="account__customer__level">{{ levelTitle }}</text>
          <navigator class="account__customer__navigator--text" url="/pages/profile/index" open-type="navigate" hover-class="none">填写微信号</navigator>
        </view>
        <view class="account__customer__caption__referral">
          <text class="account__customer__referral-code">邀请ID：{{ customer.referral_code }}</text>
          <button class="account__customer__btn--copy-referral-code">复制</button>
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
import { mapState } from 'vuex'
import _ from 'lodash'
import './index.scss'

export default {
  name: 'Account',
  components: {},
  computed: {
    ...mapState('customer', {
      customer: (state) => state.data || {}
    }),
    levelTitle () {
      return _.get(this.customer, 'level.title')
    }
  },
  methods: {
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
