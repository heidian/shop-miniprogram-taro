<template>
  <view class="input-number">
    <view class="input-number__btn input-number__minus" @tap="changeInputValue(+inputValue - 1)">-</view>
    <input
      class="input-number__input" type='number'
      v-model="inputValue" @input="onInput" @blur="onBlur"
    />
    <view class="input-number__btn input-number__add" @tap="changeInputValue(+inputValue + 1)">+</view>
  </view>
</template>

<script>
export default {
  name: 'InputNumber',
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
      // styles,
      inputValue: '' + (+this.value || 0)  // 确保 inputValue 是个字符串
    }
  },
  mounted() {
    // console.log(this.$style) //, styles)
  },
  methods: {
    changeInputValue(quantity) {
      quantity = +quantity || 0
      quantity = Math.max(quantity, this.min)
      quantity = Math.min(quantity, this.max)
      this.inputValue = '' + quantity
      this.$emit('change', quantity)
    },
    onInput(e) {
      // const value = '' + e.detail.value
      const value = '' + this.inputValue
      if (value !== '') {
        this.changeInputValue(value)
      }
    },
    onBlur() {
      if (!+this.inputValue) {
        // 如果清空了 input, 就恢复原来的值
        this.changeInputValue(this.value)
      }
    }
  },
  watch: {
    value(newValue, oldValue) {
      if (+newValue != +oldValue) {
        this.inputValue = '' + (+this.value || 0)
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables';
.input-number {
  border: 1px solid $color-divider;
  position: relative;
  padding-left: 30px;
  padding-right: 30px;
  width: 200px;  // 加一个默认宽度
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
