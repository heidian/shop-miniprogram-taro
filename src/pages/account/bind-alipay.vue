<template>
  <view class="page page--alipay">
    <view class="alipay__form">
      <view class="form__field">
        <view class="form__field__label">支付宝</view>
        <view class="form__field__body">
          <input type="text" class="form__field__control" :value="form.alipay" placeholder="请输入支付宝账号" @input="(e) => onInput('alipay', e)"/>
        </view>
      </view>

      <view class="form__field">
        <view class="form__field__label">姓名</view>
        <view class="form__field__body">
          <input type="text" class="form__field__control" :value="form.full_name" placeholder="请输入支付宝姓名" @input="(e) => onInput('full_name', e)"/>
        </view>
      </view>

      <view class="form__field">
        <view class="form__field__label">证件类型</view>
        <view class="form__field__body">
          <input type="text" class="form__field__control" value="证件类型" disabled/>
        </view>
      </view>

      <view class="form__field">
        <view class="form__field__label">证件号</view>
        <view class="form__field__body">
          <input type="idcard" class="form__field__control" :value="form.identification_number" placeholder="请输入身份证号" @input="(e) => onInput('identification_number', e)"/>
        </view>
      </view>
    </view>
    <view class="alipay__addition">
      <label @tap="toggleChecked">
        <checkbox :checked="checked" class="alipay__addition__checkbox"></checkbox>
        <view class="alipay__addition__checkbox--fake" :class="{checked: checked}"></view>
      </label>
      <view class="alipay__addition__message">
        <text class="alipay__addition__text">请如实填写以上信息，并同意接受</text><navigator class="alipay__addition__navigator">《HeyShop支付相关协议》</navigator>
      </view>
    </view>
    <button class="alipay__btn" :class="{'disabled': disableSubmit }" :disabled="disableSubmit" @tap="onSubmitForm">下一步</button>
  </view>
</template>

<script>
export default {
  name: 'BindAlipay'
  data() {
    return {
      form: {},
      checked: false
    }
  },
  computed: {
    disableSubmit () {
      const { alipay, full_name, identification_number } = this.form || {}
      return !alipay || !full_name || !identification_number || !this.checked
    }
  },
  methods: {
    onInput (field, e) {
      this.form = {
        ...this.form,
        [field]: e.detail.value
      }
    },
    toggleChecked () {
      this.checked = !this.checked
    },
    onSubmitForm () {
      console.log(this.form, this.checked)
    }
  },
}
</script>

<style lang="scss">
$color-bg: #f0f0f0;
$color-bg-white: #ffffff;
$color-divider: rgba(#979797, 0.1);
$color-text: #262626;
$color-text-light: rgba(#262626, 0.6);
$color-checkbox-border: rgba(#262626, 0.15);

.page {
  min-height: 100vh;
}
.page--alipay {
  background-color: $color-bg;
  padding-bottom: 90px;
}
.alipay {
  &__form {
    background-color: $color-bg-white;
  }
}
.form__field {
  width: 100%;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  position: relative;
  &__label {
    margin-right: 20px;
    font-size: 15px;
    color: $color-text;
    width: 70px;
    text-align: left;
  }
  &__body {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__control {
    width: 100%;
    padding: 5px 15px;
    line-height: 22px;
    font-size: 14px;
    height: 32px;
  }
  &__ft {
    margin-left: 20px;
  }
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 15px;
    right: 15px;
    bottom: 0;
    border-bottom: 1px solid $color-divider;
  }
  &__ft__icon {
    width: 10px;
    height: 12px;
    opacity: 0.2;
  }
}
.alipay__addition {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 20px;
  color: $color-text-light;
}
.alipay__addition__checkbox {
  display: none;
  &--fake {
    width: 20px;
    height: 20px;
    background-color: transparent;
    border: 1px solid $color-checkbox-border;
    border-radius: 50%;
    position: relative;
  }
  &--fake::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 2px;
    bottom: 2px;
    left: 2px;
    background-color: transparent;
    border-radius: 50%;
  }
  &--fake.checked {
    border-color: $color-text;
  }
  &--fake.checked::after {
    background-color: $color-text;
  }
}
.alipay__addition__message {
  padding-left: 10px;
  width: 100%;
}
.alipay__addition__text,
.alipay__addition__navigator {
  display: inline;
  white-space: wrap;
}
.alipay__btn {
  position: fixed;
  bottom: 30px;
  left: 20px;
  right: 20px;
  padding: 10px 0;
  line-height: 28px;
  margin-left: auto;
  margin-right: auto;
  color: #ffffff;
  background-color: $color-text;
  font-size: 16px;
  border-radius: 0;
  &:disabled,
  &[disabled],
  &.disabled {
    cursor: not-allowed;
    background-color: $color-text-light;
  }
}
</style>

