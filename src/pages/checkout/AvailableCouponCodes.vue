<template>
  <drawer-bottom
    :visible="isVisible" @close="onClose" @open="onOpen"
    header="优惠券" class="checkout__coupon_codes"
  >
    <scroll-view :scrollY="true" :scrollWithAnimation="true" class="coupon-codes-list">
      <view v-if="pending" class="loading-text">正在加载</view>
      <template v-else>
        <view
          v-for="(couponCode, index) in availableCouponCodes" :key="`${couponCode.id}-${index}`"
          class="coupon-codes-item" @tap="() => handleSelect(couponCode.id)"
        >
          <image class="image"></image>
          <view class="caption">
            <view class="title">{{ couponCode.title }}</view>
            <view class="verbose_title">{{ couponCode.verbose_title }}</view>
            <view class="start-end">
              {{ couponCode.ends_at ? `截止 ${formatDateTime(couponCode.ends_at)}` : '无截止时间' }}
            </view>
          </view>
          <icon
            v-if="usedCouponCodeId === couponCode.id"
            type="success" size="20" color="#ff5a00" class="check"
          ></icon>
        </view>
      </template>
    </scroll-view>
  </drawer-bottom>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { formatDateTime } from '@/utils/formatters'
import DrawerBottom from '@/components/DrawerBottom'

export default {
  name: 'AvailableCouponCodes',
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
      availableCouponCodes: (state) => [
        // ...state.availableCouponCodes,
        // ...state.availableCouponCodes,
        // ...state.availableCouponCodes,
        ...state.availableCouponCodes
      ],
      pending: (state) => state.pending,
      usedCouponCodeId: (state) => _.get(state.data, 'coupon_codes[0].id')
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
      // 可以考虑优化下, 不要每次 open 的时候都取, 但这个问题也不是太大
      this.$store.dispatch('checkout/fetchAvailableCouponCodes')
    },
    async handleSelect(couponCodeId) {
      Taro.showLoading({})
      if (this.usedCouponCodeId !== couponCodeId) {
        try {
          await this.$store.dispatch('checkout/addCoupon', {
            id: couponCodeId
          })
          this.isVisible = false
        } catch(err) {
          // console.log('使用优惠券失败', err)
          Taro.showToast({ title: '使用优惠券失败', icon: 'none', duration: 2000 })
        }
      } else {
        try {
          await this.$store.dispatch('checkout/removeCoupons')
          this.isVisible = false
        } catch(err) {}
      }
      Taro.hideLoading()
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
@import '@/styles/variables';
.checkout__coupon_codes {
  .loading-text {
    padding: 20px;
    text-align: center;
    color: $color-text-lighter;
  }
  .coupon-codes-list {
    height: 60vh;
  }
  .coupon-codes-item {
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
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
        color: $color-text-lighter;
        font-size: 0.8em;
      }
    }
    .check {
      position: absolute;
      right: 10px;
      top: 30px;
    }
  }
}
</style>
