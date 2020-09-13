<template>
  <view class="page page--profile">
    <view class="profile__navigators">
      <template v-for="item in navigators">
        <button v-if="item.openType" class="cell" :key="item.label" openType="contact">
          <view class="cell__label">{{ item.label }}</view>
          <view class="cell__value"></view>
          <view class="cell__ft">
            <image v-if="item.hasCaret" class="cell__ft__icon" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
          </view>
        </button>
        <navigator v-else class="cell" :key="item.label">
          <view class="cell__label">{{ item.label }}</view>
          <view class="cell__value"></view>
          <view class="cell__ft">
            <image v-if="item.hasCaret" class="cell__ft__icon" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
          </view>
        </navigator>
      </template>
    </view>
    <button class="page__btn page__btn--red" @tap="handleLogout">登出</button>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import RequiresLogin from '@/mixins/RequiresLogin'

export default {
  name: 'Profile',
  mixins: [ RequiresLogin ],
  data() {
    return {
      navigators: [
        { label: '微信号', value: '', hasCaret: true, url: '' },
        { label: '个人信息', value: '', hasCaret: true, url: '' },
        { label: '账户安全', value: '', hasCaret: true, url: '' },
        { label: '联系客服', value: '', hasCaret: true, url: '', openType: 'contact' },
        { label: '关于', value: '', hasCaret: true, url: '' },
      ]
    }
  },
  methods: {
    handleLogout () {
      this.$store.dispatch('customer/logout')
    }
  }
}
</script>

<style lang="scss">
$color-bg: #f0f0f0;
$color-bg-white: #ffffff;
$color-divider: rgba(#979797, 0.1);
$color-text: #262626;
$color-red: #e74c3c;
$color-golden: #e7cba7;

.page {
  min-height: 100vh;
  padding-bottom: 90px;
}
.page--profile {
  background-color: $color-bg;
}
.profile {
  &__navigators {
    background-color: $color-bg-white;
  }
}
.cell {
  background-color: transparent;
  margin-left: auto;
  margin-right: auto;
  outline: none;
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  position: relative;
  line-height: 2.2;
  &::after {
    display: none;
  }
  &__label {
    margin-right: 20px;
    font-size: 15px;
    color: $color-text;
  }
  &__value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__ft {
    margin-left: 20px;
  }
  // & + & {
  //   border-top: 1px solid $color-divider;
  // }
  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 15px;
    right: 15px;
    bottom: 0;
    border-bottom: 1px solid $color-divider;
  }
  &__ft__icon {
    width: 10px;
    height: 12px;
    opacity: 0.2;
  }
}
.page__btn {
  position: fixed;
  bottom: 30px;
  left: 20px;
  right: 20px;
  padding: 10px 0;
  text-align: center;
  line-height: 28px;
  margin-left: auto;
  margin-right: auto;
  color: #ffffff;
  background-color: $color-red;
  font-size: 16px;
  border-radius: 0;
  &.page__btn--golden {
    background-color: $color-golden;
  }
}
</style>

