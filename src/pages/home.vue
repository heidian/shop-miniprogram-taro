<template>
  <view :class="$style['page']" :style="{'paddingTop': pagePaddingTop, ...$globalColors}">
    <view :class="$style['navWrapper']" :style="{'paddingTop': navWrapperPaddingTop}">
      <view :class="$style['navbar']">
        <view :class="$style['navbarLeft']">
          <navigator
            url="/pages/search/index" open-type="navigate"
            :class="$style['navbarButton']" hover-class="none"
          ><text class="el-icon-search"></text></navigator>
        </view>
        <view :class="$style['navbarTitle']">{{ shopTitle }}</view>
        <view :class="$style['navbarRight']"></view>
      </view>
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
    statusBarHeight() {
      return this.system.statusBarHeight
    },
    navbarHeight() {
      return 44
    },
    pagePaddingTop() {
      return Taro.pxTransform(this.statusBarHeight + this.navbarHeight)
    },
    navWrapperPaddingTop() {
      return Taro.pxTransform(this.statusBarHeight)
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
.navWrapper {
  width: 100%;
  position: fixed;
  z-index: $z-index-navbar;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background-color: #ffffff;
}
.navbar {
  height: 44px;
  // background-color: red;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.navbarTitle {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
}
.navbarLeft,
.navbarRight {
  min-height: 1px;
  width: 100px;
}
.navbarLeft {
  display: flex;
  padding-left: 8px;
}
.navbarButton {
  padding: 5px 7px;
  font-size: 18px;
  line-height: 20px;
  // :global([class^="el-icon-"]) {
  //   color: $color-text;
  // }
}
</style>
