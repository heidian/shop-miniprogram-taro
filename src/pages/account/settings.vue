<template>
  <view :class="$style['settings']">
    <view :class="$style['navigators']">
      <template v-for="item in navigators">
        <button v-if="item.openType" :class="$style['cell']" :key="item.label" openType="contact">
          <view :class="$style['cellLabel']">{{ item.label }}</view>
          <view :class="$style['cellValue']"></view>
          <view :class="$style['cellFt']">
            <image v-if="item.hasCaret" :class="$style['cellftIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
          </view>
        </button>
        <navigator v-else :class="$style['cell']" :key="item.label">
          <view :class="$style['cellLabel']">{{ item.label }}</view>
          <view :class="$style['cellValue']"></view>
          <view :class="$style['cellFt']">
            <image v-if="item.hasCaret" :class="$style['cellftIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
          </view>
        </navigator>
      </template>
    </view>
    <button class="btn--red" :class="$style['pageBtn']" @tap="handleLogout">登出</button>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import RequiresLogin from '@/mixins/RequiresLogin'

export default {
  name: 'Settings',
  mixins: [ RequiresLogin ],
  data() {
    return {
      navigators: [
        { label: '微信号', value: '', hasCaret: true, url: '' },
        { label: '个人信息', value: '', hasCaret: true, url: '/pages/account/profile' },
        { label: '账户安全', value: '', hasCaret: true, url: '' },
        { label: '联系客服', value: '', hasCaret: true, url: '', openType: 'contact' },
        { label: '关于', value: '', hasCaret: true, url: '' },
      ]
    }
  },
  created () {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  methods: {
    handleLogout () {
      this.$store.dispatch('customer/logout')
      Taro.reLaunch({ url: '/pages/account/index' })
    }
  }
}
</script>

<style lang="scss" module>
$color-bg: #f0f0f0;
$color-bg-white: #ffffff;
$color-divider: rgba(#979797, 0.1);
$color-text: #262626;
$color-red: #e74c3c;
$color-golden: #e7cba7;

page {
  background-color: $color-bg;
}
.settings {
  min-height: 100vh;
  padding-bottom: 90px;
}
.navigators {
  background-color: $color-bg-white;
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
  .cellLabel {
    margin-right: 20px;
    font-size: 15px;
    color: $color-text;
  }
  .cellValue {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cellFt {
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
  .cellftIcon {
    width: 10px;
    height: 12px;
    opacity: 0.2;
  }
}
.pageBtn {
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
  &.pageBtn--golden {
    background-color: $color-golden;
  }
}
</style>

