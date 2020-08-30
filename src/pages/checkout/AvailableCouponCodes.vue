<template>
  <drawer-bottom
    :visible="isVisible" @close="onClose" @open="onOpen"
    header="优惠券" class="checkout__coupon_codes"
  >
    <scroll-view :scrollY="true" :scrollWithAnimation="true" class="coupon-codes-list">
      <view v-if="pending">正在加载</view>
      <template v-else>
        <view v-for="(couponCode, index) in availableCouponCodes" :key="index" class="coupon-codes-item">
          <image class="image"></image>
          <view class="caption">
            <view class="title">{{ couponCode.title }}{{ couponCode.title }}{{ couponCode.title }}</view>
            <view class="verbose_title">{{ couponCode.verbose_title }}</view>
            <view class="start-end">
              {{ couponCode.ends_at ? formatDateTime(couponCode.ends_at) : '无截止时间' }}
            </view>
          </view>
          <view class="check"></view>
        </view>
      </template>
    </scroll-view>
  </drawer-bottom>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { formatDateTime } from '@/utils/formatters'
import DrawerBottom from '@/components/DrawerBottom'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    DrawerBottom
  },
  data() {
    return {
      isVisible: !!this.visible
    }
  },
  computed: {
    ...mapState('checkout', {
      availableCouponCodes: (state) => [...state.availableCouponCodes, ...state.availableCouponCodes, ...state.availableCouponCodes, ...state.availableCouponCodes],
      pending: (state) => state.pending
    })
  },
  methods: {
    formatDateTime,
    onClose() {
      // 这个组件不需要触发 open/close 事件, 纯粹把 visible 状态和页面同步就行
      this.$emit('update:visible', false)
    },
    onOpen() {
      this.$emit('update:visible', true)
      this.$store.dispatch('checkout/fetchAvailableCouponCodes')
    }
  },
  watch: {
    visible(newValue) {
      this.isVisible = !!newValue
    }
  }
}
</script>

<style lang="scss">
@import "_variables";
.checkout__coupon_codes {
  .coupon-codes-list {
    height: 60vh;
  }
  .coupon-codes-item {
    height: 80px;
    border-radius: 8px;
    background-color: #fff;
    margin: 10px;
    padding: 10px 50px 10px 90px;
    position: relative;
    .image {
      position: absolute;
      left: 0;
      top: 0;
      width: 80px;
      height: 80px;
      background-color: #aaa;
    }
    .caption {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      >.title, >.verbose_title, >.start-end {
        overflow: hidden;
        white-space: nowrap;
        max-width: 100%;
        text-overflow: ellipsis;
      }
      >.verbose_title, >.start-end {
        color: $color-text-light;
        font-size: 0.8em;
      }
    }
    .check {
      position: absolute;
      right: 10px;
      top: 25px;
      width: 30px;
      height: 30px;
      background-color: red;
    }
  }
}
</style>
