<template>
  <view :class="$style['customNav']" :style="navBarStyle">
    <input
      :class="$style['input']"
      type="text"
      placeholder="搜索商品关键词"
      v-model="cachedQ"
      confirm-type="search"
      @confirm="onSubmitSearch">
    <view
      v-if="showBack" @tap="goBack"
      :class="$style['button']" :style="buttonStyle"
    ><text class="el-icon-arrow-left"></text></view>
    <navigator
      v-else url="/pages/home" open-type="switchTab"
      :class="$style['button']" :style="buttonStyle" hover-class="none"
    ><text class="el-icon-s-home"></text></navigator>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    q: {
      type: String,
      required: false,
      default: ''
    },
  },
  data() {
    return {
      cachedQ: this.q || ''
    }
  },
  computed: {
    ...mapState(['system']),
    customNavHeight() {
      return this.system.statusBarHeight + 44
    },
    navBarStyle() {
      return {
        'height': Taro.pxTransform(this.customNavHeight),
        'paddingTop': Taro.pxTransform(this.system.statusBarHeight + 3)
      }
    },
    buttonStyle() {
      return {
        'top': Taro.pxTransform(this.system.statusBarHeight + 3)
      }
    },
    showBack() {
      return Taro.getCurrentPages().length > 1
    }
  },
  watch: {
    q(newValue) {
      this.cachedQ = newValue || ''
    }
  },
  methods: {
    onSubmitSearch() {
      this.$emit('submit', this.cachedQ)
    },
    goBack() {
      Taro.navigateBack()
    },
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables.scss';
.customNav {
  width: 100%;
  position: fixed;
  z-index: $z-index-navbar;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background-color: #ffffff;
  padding-right: 100px;
  padding-left: 50px;
  padding-bottom: 5px;
}
.input {
  width: 100%;
  height: 32px;
  line-height: 32px;
  border: 1px solid $color-divider;
  border-radius: 16px;
  padding: 5px 15px;
}
.button {
  position: absolute;
  top: 0;
  left: 10px;
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid $color-divider;
  border-radius: 16px;
  :global([class^="el-icon-"]) {
    display: block;
    font-size: 18px;
    color: $color-text;
  }
}
</style>
