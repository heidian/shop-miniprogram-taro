<template>
  <view class="page--address-edit">
    <form class="form">
      <view class="form-control">
        <view class="label">收货人</view>
      </view>
      <view class="form-control">
        <view class="label">联系电话</view>
      </view>
      <view class="form-control">
        <view class="label">所在区域</view>
      </view>
      <view class="form-control">
        <view class="label">详细地址</view>
      </view>
    </form>
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
        id: null,
        pending: false,
        data: {
          province: '',
          city: '',
          district: '',
          address1: '',
          address2: '',
          full_name: '',
          mobile: ''
        }
      }
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
    }
  }
}
</script>

<style lang="scss">
$color-text: #222;
$color-bg-gray: #f8f8f8;
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
  }
  .form-control {
    height: 44px;
    position: relative;
    margin-left: 100px;
    border-bottom: 1px solid $color-divider;
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
}
</style>
