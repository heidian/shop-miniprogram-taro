<template>
  <view :class="$style.inputNumber">
    <view :class="[$style.btn, $style.minus]" @tap="changeInputValue(+inputValue - 1)">-</view>
    <input
      :class="$style.input" type='number'
      v-model="inputValue" @input="onInput" @blur="onBlur"
    />
    <view :class="[$style.btn, $style.add]" @tap="changeInputValue(+inputValue + 1)">+</view>
  </view>
</template>

<script>
import styles from './InputNumber.module.scss'
/* 有两种方式可以引入 cssModules,
 * 一个是在下面的 style 上加 module, 然后直接在 template 里使用 $style
 * 另一个是直接从 xxx.module.scss 文件 import, 但是要把这个 styles 变量放进 data 里
 */

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

<style lang="scss" module>
/*$color-divider: #f0f0f0;*/
.inputNumber {
  /*border: 1px solid $color-divider;*/
  position: relative;
  padding-left: 30px;
  padding-right: 30px;
}
.input {
  text-align: center;
}
.input, .btn {
  height: 30px;
  line-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn {
  text-align: center;
  width: 30px;
  position: absolute;
  top: 0;
}
.minus {
  left: 0;
}
.add {
  right: 0;
}
</style>
