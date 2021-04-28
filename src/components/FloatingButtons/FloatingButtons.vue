<template>
  <view :class="{
    'floating-buttons--hidden': hidden,
    'floating-buttons': true,
    'collapsible': !$slots.default || $slots.default.length > 1,
    'collapsed': collapsed
  }">
    <template v-if="!$slots.default">
      <floating-button-item @tap="goToCart">
        <text class="el-icon-shopping-cart-2"></text>
        <text>购物车</text>
      </floating-button-item>
      <floating-button-item open-type="share">
        <text class="el-icon-share"></text>
        <text>分享</text>
      </floating-button-item>
      <floating-button-item open-type="contact">
        <text class="el-icon-headset"></text>
        <text>客服</text>
      </floating-button-item>
      <!-- <floating-button-item>
        <text class="el-icon-more"></text>
      </floating-button-item> -->
      <floating-button-item class="floating-buttons__collapse" @tap="collapsed=!collapsed">
        <!-- <text class="el-icon-plus"></text> -->
        <text class="el-icon-close"></text>
      </floating-button-item>
    </template>
    <template v-else>
      <slot></slot>
      <floating-button-item class="floating-buttons__collapse" @tap="collapsed=!collapsed">
        <!-- <text class="el-icon-plus"></text> -->
        <text class="el-icon-close"></text>
      </floating-button-item>
    </template>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import FloatingButtonItem from './FloatingButtonItem'

export default {
  name: 'FloatingButtons',
  components: {
    FloatingButtonItem,
  },
  props: {},
  data() {
    return {
      collapsed: false
    }
  },
  computed: {
    hidden() {
      const globalFloatingButtons = _.get(this.$store.state.theme, 'themeSettingsData.globalFloatingButtons')
      // 如果有自定义的按钮, 就忽略配置
      return !this.$slots.default && !globalFloatingButtons
    }
  },
  mounted() {},
  methods: {
    goToCart() {
      Taro.switchTab({ url: '/pages/cart/index' })
    }
  },
  watch: {}
}
</script>

<style lang="scss">
@import '@/styles/mixins';
@import '@/styles/variables';
.floating-buttons {
  position: fixed;
  z-index: $z-index-navbar;
  bottom: 15px;
  right: 20px;
}
.floating-buttons--hidden {
  display: none;
}
.floating-buttons__item {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(#fff, 0.95);
  box-shadow: 0 0 5px rgba(#000, 0.3);
  margin: 10px 0;
  &::after {
    display: none;
  }
  font-size: 8px;
  line-height: 1;
  [class^="el-icon-"] {
    font-size: 20px;
  }
  .el-icon-close {
    // 关闭/打开 按钮大一点
    font-size: 25px;
  }
}
.floating-buttons__collapse {
  display: none;
}
.floating-buttons.collapsible {
  .floating-buttons__collapse {
    display: flex;
  }
  .floating-buttons__item {
    transform: translate3d(0, 0, 0) rotate(0);
    transition: all .35s ease-in-out;
    // opacity: 1;
    // visibility: visible;
    // will-change: transform, opacity, visible;
  }
  &.collapsed {
    .floating-buttons__item:nth-last-child(1) { transform: translate3d(0, 0, 0) rotate(45deg); }
    .floating-buttons__item:nth-last-child(2) { transform: translate3d(0, 50px, 0) rotate(360deg); }
    .floating-buttons__item:nth-last-child(3) { transform: translate3d(0, 100px, 0) rotate(360deg); }
    .floating-buttons__item:nth-last-child(4) { transform: translate3d(0, 150px, 0) rotate(360deg); }
    .floating-buttons__item:nth-last-child(5) { transform: translate3d(0, 200px, 0) rotate(360deg); }
    .floating-buttons__item:nth-last-child(6) { transform: translate3d(0, 250px, 0) rotate(360deg); }
    .floating-buttons__item:nth-last-child(n+2) {
      opacity: 0;
      visibility: hidden;
    }
  }
}
</style>
