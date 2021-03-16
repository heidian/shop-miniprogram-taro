<template>
  <view :class="$style['page']" :style="$globalColors">
    <view
      v-for="item in favorites.data" :key="item.id"
      :class="$style['favoriteItem']" @tap="goToProduct(item)"
    >
      <template v-if="item.owner">
        <image :class="$style['productImage']" :src="optimizeImage(item.owner.image, 100)" mode="aspectFill"></image>
        <view :class="$style['textWrapper']">
          <view :class="$style['productTitle']">{{ item.owner.title }}</view>
          <price
            :class="$style['productPrice']" :highlight="true" :keepZero="true"
            :price="item.owner.price" :compareAtPrice="item.owner.compare_at_price"
          ></price>
        </view>
      </template>
      <view v-else>商品已删除</view>
    </view>
    <view v-if="hasMore" :class="$style['loadMore']"><text class="el-icon-more"></text></view>
    <template v-else>
      <view style="margin-top: 20px; text-align: center;">猜你喜欢</view>
      <infinite-products></infinite-products>
    </template>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'
import ListTable from '@/mixins/ListTable'
import InfiniteProducts from '@/components/InfiniteProducts'
import Price from '@/components/Price'

export default {
  name: 'Favorites',
  components: {
    Price,
    InfiniteProducts
  },
  mixins: [
    ListTable('favorites', { urlRoot: '/customers/favorite/' })
  ],
  data() {
    return {}
  },
  computed: {
    ...mapState(['customer']),
    hasMore() {
      return this.favorites.data.length < this.favorites.count
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#f6f6f6',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  onReachBottom() {
    if (this.hasMore) {
      this.fetchFavorites({ more: true })
    } else {
      this.$store.dispatch('lists/infiniteProducts/listMore')
    }
  },
  mounted() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    } else {
      this.fetchFavorites()
    }
  },
  methods: {
    optimizeImage,
    async fetchFavorites({ more=false } = {}) {
      Taro.showNavigationBarLoading()
      if (more) {
        await this.fetchMore()
      } else {
        await this.fetchList()
      }
      Taro.hideNavigationBarLoading()
    },
    goToProduct(item) {
      if (item.owner) {
        Taro.navigateTo({ url: `/pages/product/index?name=${item.owner.name}` })
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
.page {
  padding: 10px 0;
}
.favoriteItem {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  position: relative;
  + .favoriteItem {
    // border-top: 1px solid $color-divider;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 10px;
      right: 0;
      border-top: 1px solid $color-divider;
    }
  }
}
.productImage {
  width: 100px;
  height: 100px;
  display: block;
}
.textWrapper {
  display: flex;
  flex: 1;
  height: 100px;
  padding: 2px 0 2px 10px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}
.productTitle {
  font-size: 0.95em;
  font-weight: bold;
}
.productPrice {
  font-size: 1.1em;
}
.loadMore {
  text-align: center;
  font-size: 20px;
  padding: 10px 15px;
  color: $color-text-lighter;
}
</style>
