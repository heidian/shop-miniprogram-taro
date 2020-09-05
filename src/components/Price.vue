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
      priceValue: [],
      compareValue: null
    }
  },
  created() {
    this.parseValues()
  },
  methods: {
    parseValues() {
      const priceValue = formatCurrency(this.price, { keepZero: this.keepZero })
      const compareValue = formatCurrency(this.compareAtPrice, { keepZero: this.keepZero })
      this.priceValue = priceValue,
      this.compareValue = (parseFloat(this.compareAtPrice) > parseFloat(this.price)) ? compareValue : null
    }
  },
  watch: {
    price(newValue, oldValue) {
      this.parseValues()
    },
    compareAtPrice(newValue, oldValue) {
      this.parseValues()
    }
  }
}
</script>

<style lang="scss">
$color-text: #262626;
$color-text-light: #555;
$color-orange: #ff5a00;
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
    }
    .price__rmb, .price__points {
      font-size: 0.8em;
    }
  }
  .price--compare {
    color: $color-text-light;
    text-decoration: line-through;
    font-size: 0.8em;
  }
}
</style>
