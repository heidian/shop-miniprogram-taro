<template>
  <view class="dialog" :class="{'dialog--visible': isVisible}">
    <view class="dialog__mask" @tap="handleClose"></view>
    <view class="dialog__body">
      <slot name="header"></slot>
      <slot></slot>
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HsDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isVisible: false
    }
  },
  computed: {
    //
  },
  mounted () {
    if (this.visible) {
      this.handleOpen()
    }
  },
  methods: {
    handleClose () {
      this.isVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleOpen () {
      this.isVisible = true
      this.$emit('update:visible', true)
      this.$emit('open')
    }
  },
  watch: {
    visible (newValue) {
      console.log('watch visible: ', newValue)
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
.dialog {
  position: fixed;
  z-index: $z-index-dialog;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  .dialog__mask {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgba(#000, 0.7);
  }
  .dialog__body {
    position: absolute;
    z-index: $z-index-dialog + 1;
    top: 50%;
    left: 10%;
    right: 10%;
    transform: translateY(-50%);
    // min-height: 300px;
    background-color: $color-bg-dialog;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  &.dialog--visible {
    opacity: 1;
    visibility: visible;
  }
  /* animation styles end */
}
</style>
