<template>
  <view class="drawer" :class="{'opened': drawerOpened}">
    <view class="drawer__mask"
      @tap="onToggleDrawer"
      @touchmove="preventScroll">
      </view>
    <view class="drawer__content select-variant">
      <view class="drawer__header">
        <image class="drawer__variant__image" :src="currentVariant.image|imageUrl" mode="aspectFill"></image>
        <view class="drawer__variant__caption">
          <view class="drawer__variant__price">{{ currentVariant.price|currency }}</view>
          <view class="drawer__variant__title">已选择{{ currentVariant.title }}</view>
        </view>
      </view>
      <view class="drawer__body">

      </view>
      <view class="drawer__footer"></view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'SelectVariant',
  props: {
    drawerOpened: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: () => {
        return {}
      }
    },
    currentVariant: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  methods: {
    onToggleDrawer () {
      this.$emit('onToggleDrawer', false)
    },
    preventScroll (e) {
      console.log(e.preventDefault)
      e.preventDefault && e.preventDefault()
      console.log(e)
      e.stopPropogation && e.stopPropogation()
    }
  },
}
</script>
<style lang="scss">
$color-highlight: #e74c3c;
$color-border: #ecf0f1;

.drawer {
  &__mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: none;
    z-index: 110;
  }
  &__content {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 800px;
    overflow: hidden;
    background-color: #ffffff;
    z-index: 120;
    padding: 220px 20px 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    transform: translate3d(0, 100%, 0);
    transition: transform .25s ease-in-out;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }
  &__header {
    position: absolute;
    left: 0;
    top: 0;
    height: 220px;
    width: 100%;
    padding: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    // box-shadow: 0 0 0 2px $color-border;
  }
  &__variant__image {
    width: 180px;
    height: 180px;
    border-radius: 8px;
    margin-right: 20px;
  }
  &__variant__caption {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  &__variant__price {
    color: $color-highlight;
    font-size: 36px;
    font-weight: bold;
    line-height: 1.6;
  }
  &__variant__title {
    font-size: 24px;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__footer {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 80px;
    width: 100%;
    background-color: rgb(0, 194, 58);
  }
  &__body {
    flex: 1;
    overflow: auto;
  }
  &.opened &__mask {
    display: block;
  }
  &.opened &__content {
    transform: translate3d(0, 0, 0);
  }
}
</style>

