<template>
  <view :style="css">
    <!-- 商品价格和添加心愿单 -->
    <view :class="$style['productHeader']">
      <price
        :class="$style['productPrice']" :highlight="true" :keepZero="true"
        :price="variant.price" :compareAtPrice="variant.compare_at_price"
      ></price>
      <!-- 暂时隐藏心愿单按钮
      <view :class="[$style['iconBtn'], $style['iconBtnFavorite']]" @tap="addToFavorite">
        <view
          :class="{'el-icon-star-on': !!favoriteId, 'el-icon-star-off': !favoriteId}"
          :style="{color: favoriteId ? '#ffd700' : 'inherit'}"
        ></view>
        <view :class="$style['iconBtnText']">心愿单</view>
      </view>
      -->
    </view>
    <!-- 商品标题和描述 -->
    <view :class="$style['productTitle']">{{ product.title }}</view>
    <view :class="$style['productDescription']">{{ product.description }}</view>
    <view :class="$style['productTags']" v-if="rebateValue">
      <view :class="[$style['tag'], $style['tagOrange']]">立赚 {{ rebateValue }}</view>
      <view :class="[$style['tag'], $style['tagGold']]" v-if="growthValue">
        <text class="el-icon-star-on" style="font-size: 1.2em;"></text>成长值 {{ growthValue }}
      </view>
      <view :class="$style['tip']" @tap="showRebateTip">?</view>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'

export default {
  name: 'ProductSingleMain',
  components: {
    Price,
  },
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({})
    },
    product: {
      type: Object,
      required: true,
    },
    variant: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      favoriteId: null,
      variantsDrawerVisible: false,
    }
  },
  computed: {
    ...mapState(['customer']),
    rebateValue() {
      const rebateRate = _.get(this.product, 'metafields.substores.rebate_rate')
      if (rebateRate && this.variant) {
        return +(+rebateRate * +this.variant.price).toFixed(2)
      }
    },
    growthValue() {
      return _.get(this.product, 'metafields.substores.growth_value')
    },
  },
  mounted() {
    this.checkFavorite()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    async checkFavorite() {
      if (this.customer.isAuthenticated) {
        const { data } = await API.get('/customers/favorite/', {
          params: {
            product: this.product.id,
            fields: 'id'
          }
        })
        this.favoriteId = _.get(data, 'results[0].id', null)
      }
    },
    addToFavorite: _.throttle(async function() {
      if (!this.customer.isAuthenticated) {
        Taro.navigateTo({ url: '/pages/login/index' })
        return
      }
      if (this.favoriteId) {
        try {
          await API.delete(`/customers/favorite/${this.favoriteId}/`)
          this.favoriteId = null
        } catch(err) { console.log(err) }
      } else {
        try {
          this.favoriteId = '0'  // 这么放一个假 id 让 UI 上的收藏标记立即变亮
          const { data } = await API.post('/customers/favorite/', {
            'owner_resource': 'product',
            'owner_id': this.product.id,
            'subscribe': true
          })
          this.favoriteId = data.id
        } catch(err) { console.log(err) }
      }
    }, 2000),
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';

/* 标题和描述 */
.productHeader,
.productTitle,
.productDescription,
.productTags {
  width: 100%;
  padding-left: 15px;
  padding-right: 15px;
}
.productHeader {
  width: 100%;
  margin: 15px auto 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.productPrice {
  display: flex;
  align-items: baseline;
  font-size: 20px;
  :global(.price--compare) {
    margin-left: 10px;
    font-size: 0.6em;
  }
}
.productTitle {
  margin: 5px auto;
  font-size: 16px;
  font-weight: bolder;
  text-align: justify;
  line-height: 1.6;
}
.productDescription {
  margin: 5px auto 15px;
  font-size: 13px;
  // color: $color-text-light;
  opacity: 0.9;
  text-align: justify;
}
.productTags {
  margin: 15px auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .tag {
    padding: 0 8px;
    font-size: 12px;
    line-height: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    margin-right: 10px;
  }
  .tagOrange {
    background-color: $color-orange;
    color: #fff;
  }
  .tagGold {
    background-image: linear-gradient(106deg, #e8cca7, #edd6b8 52%, #e6caa5 82%);
    color: #5c411a;
  }
  .tip {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    line-height: 14px;  // 因为有 border, line-height 要减去 2px
    font-size: 10px;
    text-align: center;
    border: 1px solid $color-text-lighter;
    color: $color-text-lighter;
  }
}

/* misc */
.iconBtn {
  width: 30px;
  height: 30px;
  line-height: 1;
  text-align: center;
  padding: 0;
  color: $color-text;
  background-color: transparent;
  outline: none;
  &::after {
    display: none;
  }
  [class^="el-icon-"] {
    font-size: 20px;
    height: 20px;
    overflow: hidden;
    display: block;
  }
  .iconBtnText {
    font-size: 10px;
    height: 10px;
    overflow: hidden;
    display: block;
    white-space: nowrap;
  }
}
.iconBtnFavorite {
  height: auto;
}
</style>
