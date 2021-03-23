<template>
  <drawer position="bottom" :visible="isVisible" @close="onClose" @open="onOpen" header="商品明细">
    <scroll-view :scrollY="true" :scrollWithAnimation="true" :class="$style['linesWrapper']">
      <view v-if="pending" :class="$style['loadingText']">正在加载</view>
      <template v-else>
        <view v-for="line in lines" :key="line.id" :class="$style['lineItem']">
          <image
            :class="$style['lineImage']" mode="aspectFill"
            :src="optimizeImage(line.image, 100)"
          ></image>
          <view :class="$style['lineText']">
            <view :class="$style['productTitle']">{{ line.product_title }}</view>
            <view :class="$style['variantTitle']">{{ line.variant_title }}</view>
            <view :class="$style['priceAndQuantity']">
              <price :price="line.price" :highlight="true" :keepZero="true"></price>
              <text :class="$style['lineQuantity']">x{{ line.quantity }}</text>
            </view>
          </view>
        </view>
      </template>
    </scroll-view>
  </drawer>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import Price from '@/components/Price'
import Drawer from '@/components/Drawer'

export default {
  name: 'CheckoutProducts',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Price,
    Drawer
  },
  data() {
    return {
      isVisible: !!this.visible
    }
  },
  computed: {
    ...mapState('checkout', {
      lines: (state) => [
        ...(state.data.lines || [])
      ],
      pending: (state) => state.pending
    })
  },
  methods: {
    optimizeImage,
    onClose() {
      // 这个组件不需要触发 open/close 事件, 纯粹把 visible 状态和页面同步就行
      this.$emit('update:visible', false)
    },
    onOpen() {
      // 这个组件不需要触发 open/close 事件, 纯粹把 visible 状态和页面同步就行
      this.$emit('update:visible', true)
    }
  },
  watch: {
    visible(newValue) {
      this.isVisible = !!newValue
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.loadingText {
  padding: 20px;
  text-align: center;
  color: $color-text-lighter;
}
.linesWrapper {
  height: 60vh;
}
.lineItem {
  background-color: #ffffff;
  border-radius: 4px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.lineImage {
  width: 100px;
  height: 100px;
}
.lineText {
  flex: 1;
  height: 100px;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  .productTitle {
    font-size: 0.9em;
    font-weight: bold;
  }
  .variantTitle {
    font-size: 0.85em;
    color: $color-text-light;
  }
  // .lineQuantity {
  //   font-size: 0.85em;
  //   color: $color-text-light;
  //   margin-left: 5px;
  // }
  .priceAndQuantity {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
</style>
