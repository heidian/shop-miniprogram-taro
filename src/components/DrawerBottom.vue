<template>
  <view class="drawer drawer--bottom drawer--coupons" :class="{'drawer--visible': isVisible}">
    <view class="drawer__mask" @tap="handleClose"></view>
    <view class="drawer__body">
      <view class="drawer__header">
        <text>{{ header }}</text>
        <view class="drawer__close" @tap="handleClose">×</view>
      </view>
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    header: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVisible: false
    }
  },
  computed: {
    //
  },
  mounted() {
    if (this.visible) {
      this.handleOpen()
    }
  },
  methods: {
    handleClose() {
      this.isVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleOpen() {
      this.isVisible = true
      this.$emit('update:visible', true)
      this.$emit('open')
    }
  },
  watch: {
    visible(newValue) {
      if (newValue && !this.isVisible) {
        this.handleOpen()
      } else if (!newValue && this.isVisible) {
        this.handleClose()
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/_mixins';
$z-index-drawer: 100;
$color-bg-gray: #f6f6f6;
.drawer.drawer--bottom {
  position: fixed;
  z-index: $z-index-drawer;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .drawer__mask {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgba(#000, 0.7);
  }
  .drawer__body {
    position: absolute;
    z-index: $z-index-drawer + 1;
    bottom: 0;
    left: 0;
    width: 100%;
    min-height: 300px;
    background-color: $color-bg-gray;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    overflow: hidden;
  }
  .drawer__header {
    padding: 12px;
    line-height: 20px;
    text-align: center;
    font-weight: bold;
    background-color: #fff;
    // @include clearfix();
    position: relative;
  }
  .drawer__close {
    position: absolute;
    right: 0;
    top: 0;
    display: block;
    float: right;
    font-size: 24px;
    line-height: 44px;
    width: 44px;
    height: 44px;
    text-align: center;
    opacity: 0.5;
  }
  /* animation styles start */
  opacity: 0;
  visibility: hidden;
  transition: all .1s ease-in-out;
  .drawer__body {
    transition: all .2s ease-in-out;
    transform: translate3d(0, 100%, 0);
  }
  &.drawer--visible {
    opacity: 1;
    visibility: visible;
    .drawer__body {
      transform: translate3d(0, 0, 0);
    }
  }
  /* animation styles end */
}
</style>
