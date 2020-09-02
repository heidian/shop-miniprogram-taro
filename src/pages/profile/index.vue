<template>
  <view class="page page--profile">
    <view class="profile__navigators">
      <navigator class="cell" v-for="item in navigators" :key="item.label">
        <view class="cell__label">{{ item.label }}</view>
        <view class="cell__value"></view>
        <view class="cell__ft">
          <image v-if="item.hasCaret" class="cell__ft__icon" src="https://up.img.heidiancdn.com/o_1egfmehbs19vhj4p7cn1ko4kqi0next.png" mode="aspectFill"></image>
        </view>
      </navigator>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navigators: [
        { label: '微信号', value: '', hasCaret: true, url: '' },
        { label: '个人信息', value: '', hasCaret: true, url: '' },
        { label: '账户安全', value: '', hasCaret: true, url: '' },
        { label: '联系客服', value: '', hasCaret: true, url: '' },
        { label: '关于', value: '', hasCaret: true, url: '' },
      ]
    }
  },
}
</script>

<style lang="scss">
$color-bg: #f0f0f0;
$color-bg-white: #ffffff;
$color-divider: rgba(#979797, 0.1);
$color-text: #262626;

.page {
  min-height: 100vh;
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
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  position: relative;
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
  &:not(:last-child)::after {
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
</style>

