<template>
  <view :class="$style['Coupons']" :style="css">
    <view v-for="coupon in coupons.data" :key="coupon.id" :class="$style['gridWrapper']">
      <view :class="$style['couponItem']" @tap="redeemCoupon(coupon)">
        <view :class="$style['imageWrapper']">
          <image
            :src="optimizeImage(coupon.redeem_image, 400)"
            mode="heightFix" :class="$style['image']"
          ></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'

export default {
  components: {
    Price
  },
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        couponsQuery: {},  // 商品过滤参数
      })
    }
  },
  data() {
    return {
      coupons: {
        query: {},
        data: [],
        pending: false,
      }
    }
  },
  computed: {
    //
  },
  mounted() {
    this.fetchCoupons()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    async fetchCoupons() {
      const couponsQuery = _.cloneDeep(this.settingsData.couponsQuery)
      this.coupons.pending = true
      const res = await API.get('/customers/coupon/', {
        params: {
          ...couponsQuery,
          fields: ['id', 'code_prefix', 'title', 'description', 'description_image', 'redeem_image'].join(',')
        }
      })
      this.coupons = {
        query: couponsQuery,
        data: res.data.results,
        pending: false
      }
    },
    redeemCoupon(coupon) {
      //
    }
  },
  watch: {
    'settingsData.couponsQuery': {
      handler(newVal, oldVal) {
        if (!_.isEqual(newVal, this.coupons.query)) {
          this.fetchCoupons()
        }
      },
      deep: true,
    }
  }
}
</script>

<style lang="scss" module>
.Coupons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow-x: scroll;
  .gridWrapper {
    flex: none;
    padding: 5px;
  }
}
.couponItem {
  overflow: hidden;
}
.imageWrapper {
  //
}
.image {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  height: 120px;
  width: auto;
}
</style>
