<template>
  <view :class="$style['page']">
    <view :class="$style['blackHeader']">
      <view v-if="customer.isAuthenticated" :class="$style['profile']">
        <image :class="$style['avatar']" :src="optimizeImage(customer.avatar)"></image>
        <view>
          <view>{{ customer.full_name }}</view>
          <view>{{ /*partner.level*/ '普通用户' }}</view>
        </view>
      </view>
      <view>去登录</view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  name: 'Partner',
  components: {},
  data() {
    return {
      //
    }
  },
  computed: {
    ...mapState(['customer'])
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    //
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.blackHeader {
  background-color: #020202;
  padding: 30px;
}
.profile {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.avatar {
  width: 46px;
  height: 46px;
  display: block;
}
</style>
