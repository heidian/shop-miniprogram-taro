<template>
  <view :class="$style['settings']">
    <view :class="$style['navigators']">
      <template v-for="item in navigators">
        <button v-if="item.openType" :class="$style['cell']" :key="item.label" :open-type="item.openType">
          <view :class="$style['cellLabel']">{{ item.label }}</view>
          <view :class="$style['cellValue']"></view>
          <view :class="$style['cellFt']">
            <image v-if="item.hasCaret" :class="$style['cellftIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
          </view>
        </button>
        <navigator v-else :class="$style['cell']" :key="item.label" :url="item.url" open-type="navigate">
          <view :class="$style['cellLabel']">{{ item.label }}</view>
          <view :class="$style['cellValue']"></view>
          <view :class="$style['cellFt']">
            <image v-if="item.hasCaret" :class="$style['cellftIcon']" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
          </view>
        </navigator>
      </template>
    </view>
    <view :class="$style['buttonWrapper']">
      <button type="warn" @tap="handleLogout">登出</button>
    </view>
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
        { label: '微信号', value: '', hasCaret: true, url: '/pages/profile/wechat' },
        { label: '个人信息', value: '', hasCaret: true, url: '/pages/profile/edit' },
        { label: '收货地址', value: '', hasCaret: true, url: '/pages/addresses/index' },
        // { label: '账户安全', value: '', hasCaret: true, url: '' },
        { label: '联系客服', value: '', hasCaret: true, url: '', openType: 'contact' },
        { label: '关于', value: '', hasCaret: true, url: '/pages/blog/article?name=about-heyshop' },
      ]
    }
  },
  created () {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
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
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {}
.navigators {
  background-color: #fff;
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
.buttonWrapper {
  position: fixed;
  z-index: $z-index-footer;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  button {
    display: block;
    width: 100%;
  }
}
</style>
