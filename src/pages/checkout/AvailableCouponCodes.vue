<template>
  <drawer
    :visible="isVisible" @close="onClose" @open="onOpen"
    position="bottom" header="优惠券" :class="$style['couponCodes']"
  >
    <scroll-view :scrollY="true" :scrollWithAnimation="true" :class="$style['list']">
      <view :class="$style['redeem']">
        <input type="text" :class="$style['input']" placeholder="输入优惠码兑换优惠券" v-model="codePrefix"/>
        <button :class="['button', 'button--small', 'button--dark', $style['btnRedeen']]" @tap="redeemCoupon">兑换</button>
      </view>
      <view v-if="pending" :class="$style['loadingText']">正在加载</view>
      <template v-else>
        <view
          v-for="(couponCode, index) in availableCouponCodes" :key="`${couponCode.id}-${index}`"
          :class="$style['item']" @tap="() => handleSelect(couponCode.id)"
        >
          <image :class="$style['image']"></image>
          <view :class="$style['caption']">
            <view :class="$style['title']">{{ couponCode.title }}</view>
            <view :class="$style['verboseTitle']">{{ couponCode.verbose_title }}</view>
            <view :class="$style['startEnd']">
              {{ couponCode.ends_at ? `截止 ${formatDateTime(couponCode.ends_at)}` : '无截止时间' }}
            </view>
          </view>
          <icon
            v-if="usedCouponCodeId === couponCode.id"
            type="success" size="20" color="#ff5a00" :class="$style['check']"
          ></icon>
        </view>
      </template>
    </scroll-view>
  </drawer>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import { formatDateTime } from '@/utils/formatters'
import Drawer from '@/components/Drawer'

export default {
  name: 'AvailableCouponCodes',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Drawer
  },
  data() {
    return {
      isVisible: !!this.visible,
      codePrefix: ''
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
    },
    async redeemCoupon() {
      if (this.codePrefix) {
        Taro.showLoading({ title: '优惠券兑换中' })
        try {
          await this.$store.dispatch('checkout/addCoupon', { codePrefix: this.codePrefix })
          Taro.showToast({title: '兑换成功'})
          Taro.hideLoading()
          this.codePrefix = ''
          this.isVisible = false
        } catch (err) {
          Taro.showToast({ title: '使用优惠券失败', icon: 'none', duration: 2000 })
        }
      }
    },
  },
  watch: {
    visible(newValue) {
      this.isVisible = !!newValue
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.couponCodes {
  .loadingText {
    padding: 20px;
    text-align: center;
    color: $color-text-lighter;
  }
  .list {
    height: 60vh;
  }
  .item {
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
      >.title, >.verboseTitle, >.startEnd {
        overflow: hidden;
        white-space: nowrap;
        max-width: 100%;
        text-overflow: ellipsis;
      }
      >.verboseTitle, >.startEnd {
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
  .redeem {
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
    padding: 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
  }
  .input {
    flex: 1;
    display: block;
    padding-left: 10px;
    height: 36px;
    line-height: 36px;
  }
  .btnRedeen {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
