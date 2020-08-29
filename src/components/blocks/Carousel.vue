<template>
  <view class="block--carousel" :style="css">
    <view class="carousel"></view>
  </view>
</template>

<script>
export default {
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  methods: {
    //
  }
}
</script>

<style lang="scss">
.block--carousel {
  .carousel {
    display: block;
    width: 100%;
    padding-top: 100%;
    background-color: #fff;
  }
}
</style>
