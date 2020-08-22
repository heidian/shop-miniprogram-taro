<template>
  <view class="index">
    <NumberDisplay/>
    <NumberSubmit/>
  </view>
</template>

<script>
import NumberDisplay from '@/components/example/NumberDisplay.vue'
import NumberSubmit from '@/components/example/NumberSubmit.vue'

export default {
  name: 'Index',
  components: {
    NumberDisplay,
    NumberSubmit
  }
}
</script>

<style lang="scss">
.index {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
