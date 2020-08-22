<template>
  <view>
    <!-- 普通的跳转页面, 只需要 url 就行了 -->
    <navigator
      target="self" open-type="navigate"
      url="/pages/login/index"
    >登录</navigator>
    <button type="default" @tap="logout">登出</button>
  </view>
</template>

<script>
export default {
  name: 'Account',
  components: {},
  methods: {
    logout() {
      this.$store.dispatch('customer/logout')
    }
  }
}
</script>

<style lang="scss"></style>
