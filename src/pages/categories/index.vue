<template>
  <view :class="{
    [$style['page']]: true,
    [$style['page--categories']]: true
  }">
    <view :class="$style['sidebarWrapper']">
      <side-bar :current="current" @change:current="(index) => onChangeCurrent(index)"></side-bar>
    </view>
    <view :class="$style['bodyWrapper']">
      <categories-body :current="current" @change:current="(index) => onChangeCurrent(index)"></categories-body>
    </view>
  </view>
</template>

<script>
import SideBar from './SideBar'
import CategoriesBody from './CategoriesBody'

export default {
  name: 'Categories',
  components: {
    SideBar,
    CategoriesBody
  },
  data () {
    return {
      current: 0
    }
  },
  methods: {
    onChangeCurrent (index) {
      this.current = index
    }
  },
}
</script>

<style lang="scss" module>
@import './variables.scss';
.page--categories {
  height: 100vh;
  overflow: hidden;
  background-color: $color-bg;
  position: relative;
}
.sidebarWrapper {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 92px;
}
.bodyWrapper {
  position: absolute;
  left: 92px;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
