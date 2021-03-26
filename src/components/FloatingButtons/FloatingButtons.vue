<template>
  <view class="floating-buttons">
    <template v-if="!$slots.default">
      <floating-button-item>
        <text class="el-icon-more"></text>
      </floating-button-item>
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </view>
</template>

<script>
import FloatingButtonItem from './FloatingButtonItem'

export default {
  name: 'FloatingButtons',
  components: {
    FloatingButtonItem,
  },
  props: {},
  data() {
    return {}
  },
  computed: {},
  mounted() {},
  methods: {},
  watch: {}
}
</script>

<style lang="scss">
@import '@/styles/mixins';
@import '@/styles/variables';
.floating-buttons {
  position: fixed;
  z-index: $z-index-navbar;
  bottom: 30px;
  right: 30px;
}
</style>
