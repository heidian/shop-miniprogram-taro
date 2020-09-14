<template>
  <view :class="$style['bindAlipay']">
    <view :class="$style['form']">
      <view :class="$style['field']">
        <view :class="$style['label']">支付宝</view>
        <view :class="$style['body']">
          <input type="text" :class="$style['control']" :value="form.alipay" placeholder="请输入支付宝账号" @input="(e) => onInput('alipay', e)"/>
        </view>
      </view>

      <view :class="$style['field']">
        <view :class="$style['label']">姓名</view>
        <view :class="$style['body']">
          <input type="text" :class="$style['control']" :value="form.full_name" placeholder="请输入支付宝姓名" @input="(e) => onInput('full_name', e)"/>
        </view>
      </view>

      <view :class="$style['field']">
        <view :class="$style['label']">证件类型</view>
        <view :class="$style['body']">
          <input type="text" :class="$style['control']" value="证件类型" disabled/>
        </view>
      </view>

      <view :class="$style['field']">
        <view :class="$style['label']">证件号</view>
        <view :class="$style['body']">
          <input type="idcard" :class="$style['control']" :value="form.identification_number" placeholder="请输入身份证号" @input="(e) => onInput('identification_number', e)"/>
        </view>
      </view>
    </view>
    <view :class="$style['addition']">
      <label @tap="toggleChecked">
        <checkbox :checked="checked" :class="$style['additionCheckbox']"></checkbox>
        <view :class="{[$style['additionCheckboxFake']]: true, [$style['checked']]: checked}"></view>
      </label>
      <view :class="$style['message']">
        <text :class="$style['text']">请如实填写以上信息，并同意接受</text><navigator :class="$style['navigator']">《HeyShop支付相关协议》</navigator>
      </view>
    </view>
    <button :class="{[$style['alipayBtn']]: true, [$style['disabled']]: disableSubmit }" :disabled="disableSubmit" @tap="onSubmitForm">下一步</button>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import RequiresLogin from '@/mixins/RequiresLogin'

export default {
  name: 'BindAlipay',
  mixins: [ RequiresLogin ],
  data() {
    return {
      form: {},
      checked: false
    }
  },
  created () {
    Taro.setBackgroundColor({
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
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

<style lang="scss" module>
$color-bg: #f6f6f6;
$color-bg-white: #ffffff;
$color-divider: rgba(#979797, 0.1);
$color-text: #262626;
$color-text-light: rgba(#262626, 0.6);
$color-checkbox-border: rgba(#262626, 0.15);

page {
  background-color: $color-bg;
}

.bindAlipay {
  min-height: 100vh;
  background-color: $color-bg;
  padding-bottom: 90px;
}
.form {
  background-color: $color-bg-white;
}
.field {
  width: 100%;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  position: relative;
  .label {
    margin-right: 20px;
    font-size: 15px;
    color: $color-text;
    width: 70px;
    text-align: left;
  }
  .body {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .control {
    width: 100%;
    padding: 5px 15px;
    line-height: 22px;
    font-size: 14px;
    height: 32px;
  }
  .ft {
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
  .ftIcon {
    width: 10px;
    height: 12px;
    opacity: 0.2;
  }
}
.addition {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 20px;
  color: $color-text-light;
}
.additionCheckbox {
  display: none;
}
.additionCheckboxFake {
  width: 20px;
  height: 20px;
  background-color: transparent;
  border: 1px solid $color-checkbox-border;
  border-radius: 50%;
  position: relative;
}
.additionCheckboxFake::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  bottom: 2px;
  left: 2px;
  background-color: transparent;
  border-radius: 50%;
}
.additionCheckboxFake.checked {
  border-color: $color-text;
}
.additionCheckboxFake.checked::after {
  background-color: $color-text;
}
.message {
  padding-left: 10px;
  width: 100%;
}
.text,
.navigator {
  display: inline;
  white-space: wrap;
}
.alipayBtn {
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

