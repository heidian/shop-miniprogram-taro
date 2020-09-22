<template>
  <view :class="$style['page']">
    <template v-if="!pending && articleData">
      <!-- <view :class="$style['title']">{{ articleData.title }}</view> -->
      <wxparse :html="articleData.body_html" />
    </template>
    <view v-else :class="$style['loading']"><text class="el-icon-more"></text></view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'

export default {
  name: 'Article',
  mixins: [],
  data() {
    return {
      pending: true,
      articleId: null,
      articleData: null
    }
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#ffffff',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#ffffff',
    })
  },
  async mounted() {
    const { name, id } = getCurrentInstance().router.params
    this.pending = true
    if (name) {
      const res = await API.get('/shopfront/article/', {
        params: { name }
      })
      this.pending = false
      this.articleData = _.get(res.data, 'results[0]')
      this.articleId = _.get(res.data, 'results[0].id')
    } else if (id) {
      try {
        const res = await API.get(`/shopfront/article/${id}/`)
        this.pending = false
        this.articleData = res.data
        this.articleId = id
      } catch(err) {
        this.pending = false
      }
    }
    if (this.articleData) {
      Taro.setNavigationBarTitle({
        title: this.articleData.title
      })
    } else {
      Taro.showModal({
        title: '找不到文章',
        content: '文章链接错误',
        showCancel: false
      })
    }
  },
  methods: {
    optimizeImage
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
page {
  background-color: #ffffff;
}
.page {
  padding: 15px;
}
.title {
  margin: 5px auto 10px;
  font-size: 1.2em;
  text-align: center;
}
.loading {
  text-align: center;
  padding: 20px;
  font-size: 2em;
  color: $color-text-lighter;
}
</style>
