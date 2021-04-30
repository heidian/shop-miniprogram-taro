<template>
  <view :class="$style['page']" :style="{'paddingTop': pagePaddingTop, ...$globalColors}">
    <view :class="$style['customNav']" :style="navBarStyle">
      <view :class="$style['title']">{{ shopTitle }}</view>
      <navigator
        url="/pages/search/index" open-type="navigate"
        :class="$style['button']" :style="buttonStyle" hover-class="none"
      ><text class="el-icon-search"></text></navigator>
    </view>
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
      :class="'_block_' + block.id"
    ></component>
    <floating-buttons />
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import ThemeBlocks from '@/mixins/ThemeBlocks'
import FloatingButtons from '@/components/FloatingButtons/FloatingButtons'
import { syncTabBarStyleWithTheme } from '@/utils'

export default {
  name: 'Home',
  mixins: [
    ThemeBlocks  // 会在页面上产生 blocks, pageType 和 pageName 三个变量
  ],
  components: {
    FloatingButtons,
  },
  data() {
    return {
      shopTitle: ''
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
    pagePaddingTop() {
      return Taro.pxTransform(this.customNavHeight)
    },
  },
  onShow() {
    if (this.$store.state.config.shopname === 'tezignlove') {
      Taro.hideTabBar()
    }
    syncTabBarStyleWithTheme()
  },
  // 不能覆盖 onLoad
  // onLoad() {},
  onReachBottom() {},
  async mounted() {
    const data = await this.fetchPageConfig('home')
    Taro.setNavigationBarTitle({
      title: data.shop.title
    })
    this.shopTitle = data.shop.title
  },
  methods: {}
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.page {}
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
  padding-left: 100px;
  padding-bottom: 5px;
}
.title {
  width: 100%;
  height: 32px;
  line-height: 32px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
