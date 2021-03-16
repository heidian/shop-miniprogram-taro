<template>
  <view :class="$style['page']" :style="$globalColors">
    <form class="form">
      <view class="form-item">
        <view class="label">收货人</view>
        <input class="input" v-model="addressData.full_name" type="text" placeholder="请输入收货人姓名" />
      </view>
      <view class="form-item">
        <view class="label">联系电话</view>
        <input class="input" v-model="addressData.mobile" type="digit" placeholder="请输入收货人手机号"/>
      </view>
      <view class="form-item">
        <view class="label">所在区域</view>
        <picker class="picker" mode="region" @change="onRegionChange" :value="regionValue">
          <view class="picker">
            {{addressData.province}} {{addressData.city}} {{addressData.district}}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <view class="label">详细地址</view>
        <input class="input" v-model="addressData.address1" type="text" placeholder="请输入收货地址"/>
      </view>
      <!-- <view>设为默认地址</view> -->
    </form>
    <view :class="$style['buttonsWrapper']">
      <button :disabled="pending" class="button button--dark" @tap="submitForm">保存</button>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'

export default {
  name: 'AddresseEdit',
  data() {
    return {
      addressData: {
        place_code: null,
        province: '',
        city: '',
        district: '',
        address1: '',
        address2: '',
        full_name: '',
        mobile: ''
      },
      addressId: null,
      pending: false
    }
  },
  computed: {
    regionValue() {
      const { province, city, district } = this.addressData
      return [province, city, district]
    }
  },
  mounted() {
    const { id } = getCurrentInstance().router.params
    if (id) {
      this.addressId = id
      this.fetchAddress()
    }
  },
  methods: {
    async fetchAddress() {
      this.pending = true
      try {
        const { data } = await API.get(`/customers/address/${this.addressId}/`)
        this.addressData = data
      } catch(err) {
        Taro.showToast({ title: '读取地址信息失败', icon: 'none', duration: 1000 })
      }
      this.pending = false
    },
    async submitForm() {
      this.pending = true
      try {
        if (this.addressId) {
          await API.put(`/customers/address/${this.addressId}/`, this.addressData)
        } else {
          await API.post(`/customers/address/`, this.addressData)
        }
        this.$store.dispatch('lists/addresses/list')  // 刷新一下地址列表
        Taro.navigateBack()
      } catch(err) {
        Taro.showToast({ title: '保存失败', icon: 'none', duration: 1000 })
      }
      this.pending = false
    },
    onRegionChange(e) {
      const { code, value } = e.detail
      this.addressData = {
        ...this.addressData,
        province: value[0] || '',
        city: value[1] || '',
        district: value[2] || '',
        place_code: code[2] || null
      }
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.buttonsWrapper {
  position: fixed;
  z-index: $z-index-footer;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 20px;
  :global(.button) {
    display: block;
  }
}
</style>
