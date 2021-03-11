<template>
  <view :class="$style['page']" :style="$globalColors">
    <component
      v-for="(block, index) in blocks" :key="index"
      :is="block.componentClass"
      :css="block.css" :settingsData="block.settings_data"
    ></component>
  </view>
</template>

<script>
import ThemeBlocks from '@/mixins/ThemeBlocks'

export default {
  name: 'Login',
  mixins: [
    ThemeBlocks  // 会在页面上产生 blocks, pageType 和 pageName 三个变量
  ],
  components: {},
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {
    this.fetchPageConfig('login')
  },
  methods: {}
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.page {
  //
}
</style>
