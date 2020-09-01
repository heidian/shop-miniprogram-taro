<template>
  <view class="input-number">
    <view class="input-number__btn input-number__minus" @tap="changeInputValue(inputValue - 1)">-</view>
    <input
      class="input-number__input" type='number'
      v-model="inputValue" @input="(e) => changeInputValue(+e.detail.value)"
    />
    <view class="input-number__btn input-number__add" @tap="changeInputValue(inputValue + 1)">+</view>
  </view>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [Number, String],
      default: 0
    },
    min: {
      type: Number,
      default: -Infinity
    },
    max: {
      type: Number,
      default: Infinity
    }
  },
  data() {
    return {
      inputValue: +this.value || 0
    }
  },
  methods: {
    changeInputValue(quantity) {
      quantity = +quantity || 0
      quantity = Math.max(quantity, this.min)
      quantity = Math.min(quantity, this.max)
      this.inputValue = quantity
      this.$emit('change', quantity)
    }
  }
}
</script>

<style lang="scss">
$color-divider: #f0f0f0;
.input-number {
  border: 1px solid $color-divider;
  position: relative;
  padding-left: 30px;
  padding-right: 30px;
  &__input {
    text-align: center;
  }
  &__input, &__btn {
    height: 30px;
    line-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__btn {
    text-align: center;
    width: 30px;
    position: absolute;
    top: 0;
  }
  &__minus {
    left: 0;
  }
  &__add {
    right: 0;
  }
}
</style>
