<template>
  <view :class="$style['customNav']" :style="customStyle">
    <input
      :class="$style['input']"
      type="text"
      placeholder="搜索商品关键词"
      v-model="cachedQ"
      confirm-type="search"
      @confirm="onSubmitSearch">
    <navigator :class="$style['home']" :style="homeBtnStyle" url="/pages/home" open-type="switchTab" hover-class="none">
      <text class="el-icon-s-home" :class="$style['homeIcon']"></text>
    </navigator>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'

export default {
  props: {
    q: {
      type: String,
      required: false,
      default: ''
    },
    customStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    homeBtnStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data() {
    return {
      cachedQ: this.q || ''
    }
  },
  watch: {
    q (newValue) {
      this.cachedQ = newValue || ''
    }
  },
  methods: {
    onSubmitSearch() {
      this.$emit('submit', this.cachedQ)
    }
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
.home {
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
  .homeIcon {
    display: block;
    font-size: 18px;
    color: $color-text;
  }
}
</style>
