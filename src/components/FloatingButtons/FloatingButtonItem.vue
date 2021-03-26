<template>
  <view class="floating-buttons__item" @tap="$emit('tap')">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'FloatingButtonItem',
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
.floating-buttons__item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(#fff, 0.95);
  box-shadow: 0 0 5px rgba(#000, 0.3);
}
</style>
