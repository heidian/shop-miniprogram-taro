<template>
  <view class="page--addresses">
    <view v-for="address in addresses.data" :key="address.id" class="address-item">
      <template v-if="intent === 'checkout'">
        <icon v-if="addressIdOnCheckout === address.id" type="success" size="20" color="#ff5a00" class="check"></icon>
        <icon v-else type="circle" size="20" class="check"></icon>
      </template>
      <view class="body" @tap="() => handleSelect(address)">
        <view class="area">{{ address.province }} {{ address.city }} {{ address.district }}</view>
        <view class="address">{{ address.address1 }} {{ address.address2 }}</view>
        <view class="contact">{{ address.full_name }} {{ address.mobile }}</view>
      </view>
      <text class="edit" @tap="() => goToEdit(address)">编辑</text>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'

export default {
  data() {
    const { intent } = getCurrentInstance().router.params
    return {
      intent: intent || null,
      addresses: {
        data: [],
        pending: false
      }
    }
  },
  computed: {
    addressIdOnCheckout() {
      if (this.intent === 'checkout') {
        return _.get(this.$store.state.checkout.data, 'shipping_address.customer_address_id')
      }
    }
  },
  mounted() {
    this.fetchAddresses()
  },
  methods: {
    async fetchAddresses() {
      this.addresses.pending = true
      try {
        const { data } = await API.get('/customers/address/')
        this.addresses.data = data
      } catch(err) {
        Taro.showToast({ title: '地址列表获取失败', icon: 'none', duration: 1000 })
      }
      this.addresses.pending = false
    },
    handleSelect(address) {
      if (this.intent === 'checkout') {
        Taro.showLoading({})
        this.$store.dispatch('checkout/updateAddress', {
          customerAddressId: address.id
        }).then((res) => {
          Taro.hideLoading()
          Taro.navigateBack()
        }).catch((err) => {
          Taro.hideLoading()
          Taro.showToast({ title: '更新地址失败', icon: 'none', duration: 1000 })
        })
      } else {
        //
      }
    },
    goToEdit(address) {
      Taro.navigateTo({ url: '/pages/addresses/edit?id=' + address.id })
    }
  }
}
</script>

<style lang="scss">
$color-text: #222;
$color-divider: #f0f0f0;
.page--addresses {
  .address-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: 15px;
    border-bottom: 1px solid $color-divider;
    .check {
      margin-right: 10px
    }
    .body {
      padding: 20px 5px;
      overflow: hidden;
      flex: 1;
    }
    .edit {
      margin-left: auto;
      padding: 10px 15px 10px 10px;
      width: 60px;
    }
    .area, .contact {
      font-size: 0.9em;
      color: lignten($color-text, 30%);
    }
    .address {
      // font-size: 1.1em;
      font-weight: bold;
      margin: 0.3em auto;
    }
  }
}
</style>
