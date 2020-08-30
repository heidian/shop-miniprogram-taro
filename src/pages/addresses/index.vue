<template>
  <view class="page--addresses">
    <view v-for="address in addresses.data" :key="address.id">
      <view @tap="() => handleSelect(address)">{{ address.address1 }}</view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
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
  mounted() {
    this.fetchAddresses()
  },
  methods: {
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
    async fetchAddresses() {
      this.addresses.pending = true
      try {
        const { data } = await API.get('/customers/address/')
        this.addresses.data = data
      } catch(err) {
        Taro.showToast({ title: '地址列表获取失败', icon: 'none', duration: 1000 })
      }
      this.addresses.pending = false
    }
  }
}
</script>

<style lang="scss">
.page--addresses {
  //
}
</style>
