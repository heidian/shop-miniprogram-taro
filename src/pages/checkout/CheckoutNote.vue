<template>
  <drawer
    position="bottom" header="备注" :class="$style['drawer']"
    :visible="isVisible" @close="onClose" @open="onOpen"
  >
    <view v-if="pending" :class="$style['loadingText']">正在加载</view>
    <template v-else>
      <view :class="$style['textWrapper']">
        <textarea
          v-model="inputContent"
          :auto-focus="true"
          :class="$style['textarea']"
          placeholder="请输入备注"
          placeholder-style="color: #d8d8d8;"
          maxlength="200"
        ></textarea>
      </view>
      <view :class="$style['buttonWrapper']">
        <button :class="['button', 'button--small', 'button--dark']" @tap="confirm">确认</button>
      </view>
    </template>
  </drawer>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import Drawer from '@/components/Drawer'

export default {
  name: 'AvailableCouponCodes',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Drawer
  },
  data() {
    return {
      isVisible: !!this.visible,
      inputContent: '',
    }
  },
  computed: {
    ...mapState('checkout', {
      note: (state) => state.data.note,
      pending: (state) => state.pending,
    })
  },
  methods: {
    onClose() {
      // 这个组件不需要触发 open/close 事件, 纯粹把 visible 状态和页面同步就行
      this.$emit('update:visible', false)
    },
    onOpen() {
      this.$emit('update:visible', true)
      this.inputContent = this.note
    },
    async confirm() {
      this.isVisible = false
      Taro.showLoading({})
      try {
        await this.$store.dispatch('checkout/updateNote', {
          note: this.inputContent
        })
        this.isVisible = false
      } catch(err) {
        console.log(err)
        Taro.showToast({ title: '更新备注失败', icon: 'none', duration: 2000 })
      }
      Taro.hideLoading()
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
.drawer {
  :global(.drawer__body) {
    background-color: $color-bg-gray;
  }
  :global(.drawer__header) {
    background-color: #fff;
  }
}
.loadingText {
  padding: 20px;
  text-align: center;
  color: $color-text-lighter;
}
.textWrapper {
  padding: 15px;
  textarea {
    display: block;
    width: 100%;
  }
}
.buttonWrapper {
  padding: 5px;
  background-color: #fff;
  button {
    display: block;
  }
}
</style>
