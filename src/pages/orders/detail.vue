<template>
  <view :class="$style['page']"></view>
</template>

<script>
import RequiresLogin from '@/mixins/RequiresLogin'

export default {
  name: 'Order',
  mixins: [ RequiresLogin ],
  data() {
    return {
      //
    }
  }
}
</script>

<style lang="scss" module>
.page {
  //
}
</style>
