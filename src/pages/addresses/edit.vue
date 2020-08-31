<template>
  <view class="page--address-edit">
    <form class="form">
      <view class="form-control">
        <view class="label">收货人</view>
        <input class="input" v-model="address.data.full_name" type="text"/>
      </view>
      <view class="form-control">
        <view class="label">联系电话</view>
        <input class="input" v-model="address.data.mobile" type="digit"/>
      </view>
      <view class="form-control">
        <view class="label">所在区域</view>
        <picker class="picker" mode="region" @change="onRegionChange" :value="regionValue">
          <view class="picker">
            {{address.data.province}} {{address.data.city}} {{address.data.district}}
          </view>
        </picker>
      </view>
      <view class="form-control">
        <view class="label">详细地址</view>
        <input class="input" v-model="address.data.address1" type="text"/>
      </view>
      <!-- <view>设为默认地址</view> -->
    </form>
    <button @tap="submitForm">保存</button>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'

export default {
  data() {
    return {
      address: {
        data: {
          place_code: null,
          province: '',
          city: '',
          district: '',
          address1: '',
          address2: '',
          full_name: '',
          mobile: ''
        },
        id: null,
        pending: false
      }
    }
  },
  computed: {
    regionValue() {
      const { province, city, district } = this.address.data
      return [province, city, district]
    }
  },
  mounted() {
    const { id } = getCurrentInstance().router.params
    if (id) {
      this.address.id = id
      this.fetchAddress()
    }
  },
  methods: {
    async fetchAddress() {
      this.address.pending = true
      try {
        const { data } = await API.get(`/customers/address/${this.address.id}/`)
        this.address.data = data
      } catch(err) {
        Taro.showToast({ title: '读取地址信息失败', icon: 'none', duration: 1000 })
      }
      this.address.pending = false
    },
    async submitForm() {
      try {
        const { data } = await API.put(`/customers/address/${this.address.id}/`, this.address.data)
      } catch(err) {
        Taro.showToast({ title: '保存失败', icon: 'none', duration: 1000 })
      }
    },
    onRegionChange(e) {
      const { code, value } = e.detail
      this.address.data = {
        ...this.address.data,
        province: value[0] || '',
        city: value[1] || '',
        district: value[2] || '',
        place_code: code[2] || null
      }
    }
  }
}
</script>

<style lang="scss">
$color-text: #262626;
$color-bg-gray: #f6f6f6;
$color-text-light: #555;
// $color-text-lighter: #aaa;
$color-divider: #f0f0f0;
.page--address-edit {
  background-color: $color-bg-gray;
  min-height: 100vh;
  .form {
    display: block;
    overflow: hidden;
    background-color: #fff;
    padding-bottom: 20px;
  }
  .form-control {
    position: relative;
    margin-left: 100px;
    height: 44px;
    border-bottom: 1px solid $color-divider;
    padding: 2px 0 1px;  // 因为有一个 border-bottom, 所以 padding-bottom 是 1px, 这样内容高度是 40px
    .input {
      display: block;
      margin: 8px 0;
      height: 24px;
      line-height: 24px;
    }
    .picker {
      display: block;
      height: 40px;
      line-height: 40px;
      margin: 0;
    }
  }
  .label {
    position: absolute;
    top: 0;
    height: 44px;
    line-height: 44px;
    width: 80px;
    left: -80px;
    color: $color-text-light;
  }
  .form-control:nth-child(4) .label {
    border-bottom: 1px solid $color-divider;
  }
}
</style>
