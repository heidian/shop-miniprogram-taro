<template>
  <scroll-view
    :class="$style['sidebar']"
    :scroll-x="false"
    :scroll-y="true"
    :enhanced="true"
    :scroll-anchoring="true"
    :show-scrollbar="false"
  >
    <view
      v-for="(item, index) in items" :key="item.id"
      :class="{
        [$style['item']]: true,
        [$style['active']]: current == index,
      }"
      @tap="onTapItem(index)"
    >
      <text :class="$style['itemText']">{{ item.title }}</text>
    </view>
  </scroll-view>
</template>
<script>
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  props: {
    current: Number
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapState('categories', {
      items: (state) => state.data
    })
  },
  methods: {
    onTapItem (idx) {
      this.$emit('change:current', idx)
    }
  },
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.sidebar {
  width: 100%;
  height: 100%;
  border-right: 1px solid $color-divider;
  background-color: #fff;
  &::-webkit-scrollbar {
    display: none;
  }
}
.item {
  width: 100%;
  text-align: center;
  margin: 5px auto;
  position: relative;
  color: $color-text;
  &::before {
    content: "";
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    border-left: 4px solid transparent;
  }
  &.active::before {
    border-left-color: $color-text;
  }
}
.itemText {
  font-size: 13px;
  font-weight: 600;
  line-height: 40px;
  white-space: nowrap;
}
</style>

