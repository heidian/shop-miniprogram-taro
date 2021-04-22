<template>
  <view class="drawer" :class="{
    'drawer--bottom': position === 'bottom',
    'drawer--right': position === 'right',
    'drawer--visible': isVisible
  }">
    <view class="drawer__mask" @tap="handleClose"></view>
    <view class="drawer__body" :style="isLikeIphoneX ? { 'paddingBottom': '20px' } : {}">
      <view class="drawer__header">
        <text>{{ header }}</text>
        <view class="drawer__close" @tap="handleClose">×</view>
      </view>
      <view class="drawer__content">
        <slot></slot>
      </view>
      <view class="drawer__footer">
        <slot name="footer"></slot>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: 'Drawer',
  props: {
    header: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      default: 'bottom'
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
    ...mapGetters('system', ['isLikeIphoneX']),
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
@import '@/styles/mixins';
@import '@/styles/variables';
.drawer {
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
    background-color: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .drawer__header {
    flex: 0;
    position: relative;
    padding: 12px;
    line-height: 20px;
    text-align: center;
    font-weight: bold;
    // @include clearfix();
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
  .drawer__content {
    flex: 1;
    overflow: auto;
  }
  .drawer__footer {
    flex: 0;
  }
  /* animation styles start */
  opacity: 0;
  visibility: hidden;
  transition: all .1s ease-in-out;
  .drawer__body {
    transition: all .2s ease-in-out;
    // transform: translate3d(0, 100%, 0);
  }
  &.drawer--visible {
    opacity: 1;
    visibility: visible;
    // .drawer__body {
    //   transform: translate3d(0, 0, 0);
    // }
  }
  /* animation styles end */
}
.drawer.drawer--bottom {
  .drawer__body {
    bottom: 0;
    left: 0;
    width: 100%;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    transform: translate3d(0, 100%, 0);
  }
  &.drawer--visible {
    .drawer__body {
      transform: translate3d(0, 0, 0);
    }
  }
}
.drawer.drawer--right {
  .drawer__body {
    top: 0;
    right: 0;
    height: 100%;
    width: 60%;
    transform: translate3d(100%, 0, 0);
  }
  &.drawer--visible {
    .drawer__body {
      transform: translate3d(0, 0, 0);
    }
  }
}
</style>
