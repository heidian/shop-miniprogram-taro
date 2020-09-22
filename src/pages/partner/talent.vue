<template>
  <view :class="$style['page']">
    <view v-for="item in referrals" :key="item.id" :class="$style['card']" >
      <view :class="$style['cardBody']">
        <image :class="$style['avatar']" :src="optimizeImage(item.avatar || DEFAULT_AVATAR)" mode="aspectFill"></image>
        <text :class="$style['title']">{{ item.full_name }}</text>
        <text :class="$style['wechat']">微信号：{{ item.wechat_id }}</text>
        <button :class="['button--small', 'button--dark', 'button--round', $style['cardBtn']]" @tap="() => copyWechat(item.wechat_id)">复制微信号</button>
      </view>
      <view :class="$style['cardFooter']">
        <text :class="$style['footerTitle']">联系带货达人，获取专属指导</text>
        <image :class="$style['steps']" :src="optimizeImage('https://up.img.heidiancdn.com/o_1eiqb43ip18dh80os5q8t7m460img.png', 400)" mode="heightFix"></image>
      </view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, DEFAULT_AVATAR } from '@/utils/image'

export default {
  name: 'Talent',
  data: () => {
    return {
      DEFAULT_AVATAR,
      referrals: []
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#020202',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
    this.getFeaturedReferrers()
  },
  async mounted() {
    const parent = await this.getParent()
    if (_.isEmpty(parent)) {
      await this.getFeaturedReferrers()
    }
  },
  methods: {
    optimizeImage,
    async getParent () {
      try {
        const res = await API.get(`/substores/partners/talent/parent/`)
        this.referrals = [res.data]
        return res.data
      } catch (err) {
        console.log(err)
      }
    },
    async getFeaturedReferrers () {
      try {
        const res = await API.get(`/substores/partners/talent/`, {
          params: {
            page_size: 5
          }
        })
        const { results = [] } = res.data
        this.referrals = results
      } catch (err) {
        console.log(err)
      }
    },
    copyWechat (content) {
      if (!content) return
      Taro.setClipboardData({ data: content }).then(() => {
        Taro.showToast({ title: "复制成功" })
      }).catch(err => {
        handleErr(err)
      })
    }
  },
}
</script>


<style lang="scss" module>
@import './talent.scss'
</style>
