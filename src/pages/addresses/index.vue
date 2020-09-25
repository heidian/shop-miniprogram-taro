<template>
  <view :class="$style['page']">
    <view v-for="address in addresses.data" :key="address.id" :class="$style['addressItem']">
      <template v-if="intent === 'checkout'">
        <icon v-if="addressIdOnCheckout === address.id" type="success" size="20" color="#ff5a00" :class="$style['check']"></icon>
        <icon v-else type="circle" size="20" :class="$style['check']"></icon>
      </template>
      <view :class="$style['body']" @tap="() => handleSelect(address)">
        <view :class="$style['area']">{{ address.province }} {{ address.city }} {{ address.district }}</view>
        <view :class="$style['address']">{{ address.address1 }} {{ address.address2 }}</view>
        <view :class="$style['contact']">{{ address.full_name }} {{ address.mobile }}</view>
      </view>
      <text :class="$style['edit']" @tap="() => goToEdit(address)">编辑</text>
    </view>
    <view :class="$style['buttonWrapper']">
      <!-- 这里不能写 @tap="goToEdit", 这样会有一个事件参数 e 传给 goToEdit, 影响函数判断 -->
      <button :class="['button--dark']" @tap="() => goToEdit()">添加新地址</button>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import RequiresLogin from '@/mixins/RequiresLogin'
import ListTable from '@/mixins/ListTable'
import { API } from '@/utils/api'

export default {
  name: 'Addresses',
  mixins: [
    RequiresLogin,
    ListTable('addresses', { storeName: 'lists/addresses' })
  ],
  data() {
    const { intent } = getCurrentInstance().router.params
    let addressIdOnCheckout = null
    if (intent === 'checkout') {
      addressIdOnCheckout = _.get(this.$store.state.checkout.data, 'shipping_address.customer_address_id')
    }
    return {
      intent: intent || null,
      addressIdOnCheckout
    }
  },
  computed: {},
  async mounted() {
    await this.fetchList()
    if (this.intent === 'checkout' && _.isEmpty(this.addresses.data)) {
      // 如果是 checkout 选择地址, 到了这一页没有地址, 直接去新建
      this.goToEdit()
    }
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
    goToEdit(address) {
      if (address) {
        if (address.id === this.addressIdOnCheckout) {
          // 取消 check 的状态, 这样编辑完返回的时候, 用户会意识到要点一下刚刚编辑的地址才能更新到 checkout 上
          this.addressIdOnCheckout = null
        }
        Taro.navigateTo({ url: '/pages/addresses/edit?id=' + address.id })
      } else {
        Taro.navigateTo({ url: '/pages/addresses/edit' })
      }
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.page {
  padding-bottom: 60px;
}
.addressItem {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 15px;
  border-bottom: 1px solid $color-divider;
}
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
.buttonWrapper {
  position: fixed;
  z-index: $z-index-footer;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 15px;
  button {
    display: block;
    width: 100%;
  }
}
</style>
