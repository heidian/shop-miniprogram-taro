<template>
  <view class="price-wrapper">
    <view :class="{'price': true, 'highlight': this.highlight}">
      <text class="price__rmb">{{ priceValue[0] }}</text><!--
      --><text>{{ priceValue[1] }}</text><!--
      --><text class="price__points" v-if="priceValue[2]">.{{ priceValue[2] }}</text>
    </view>
    <view class="price--compare" v-if="compareValue">
      <text class="price__rmb">{{ compareValue[0] }}</text><!--
      --><text>{{ compareValue[1] }}</text><!--
      --><text class="price__points" v-if="compareValue[2]">.{{ compareValue[2] }}</text>
    </view>
  </view>
</template>

<script>
/* parseFloat 和 + 不同, parseFloat 不会把 null, '' 和 [] 变成 0, 但是 + 会 */

function formatCurrency(value, { keepZero=false } = {}) {
  const decimalValue = parseFloat(value)
  if (!decimalValue && decimalValue !== 0) {
    return ['', '-', '']
  }
  let formatted = Math.abs(decimalValue).toFixed(2)
  if (!keepZero) {
    formatted = +formatted
  }
  const tuple = ('' + formatted).split('.')
  return [`${decimalValue < 0 ? '-' : ''}¥`, tuple[0], tuple[1]]
}

export default {
  props: {
    highlight: {
      type: Boolean,
      default: false
    },
    keepZero: {
      type: Boolean,
      default: false
    },
    price: {
      type: [Number, String],
      required: false
    },
    compareAtPrice: {
      type: [Number, String],
      required: false
    }
  },
  data() {
    return {
      _price: this.price,
      _compareAtPrice: this.compareAtPrice,
      priceValue: [],
      compareValue: null
    }
  },
  created() {
    this.parseValues()
  },
  methods: {
    parseValues() {
      this._price = this.price
      this._compareAtPrice = this.compareAtPrice
      const priceValue = formatCurrency(this.price, { keepZero: this.keepZero })
      const compareValue = formatCurrency(this.compareAtPrice, { keepZero: this.keepZero })
      this.priceValue = priceValue,
      // 这里一定要用 > 不能用 !=, 因为如果 compare_at_price 是 null, 那也是不等于
      this.compareValue = (parseFloat(this.compareAtPrice) > parseFloat(this.price)) ? compareValue : null
    }
  },
  watch: {
    price(newValue, oldValue) {
      // 这么判断一下可以确保 price 和 compareAtPrice 一起变化的时候只执行一次 parseValues
      if (newValue != this._price) {
        this.parseValues()
      }
    },
    compareAtPrice(newValue, oldValue) {
      if (newValue != this._compareAtPrice) {
        this.parseValues()
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables';
.price-wrapper {
  display: inline-block;
  letter-spacing: 1rpx;
  .price, .price--compare {
    display: inline-block;
    vertical-align: baseline;
  }
  .price {
    &.highlight {
      color: $color-orange;
      font-weight: bold;
    }
    .price__rmb {
      font-size: 0.75em;
    }
    .price__points {
      font-size: 0.8em;
    }
  }
  .price--compare {
    color: $color-text-lighter;
    text-decoration: line-through;
    font-size: 0.8em;
  }
}
</style>
