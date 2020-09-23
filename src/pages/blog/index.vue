<template>
  <view :class="$style['page']">
    <view
      v-for="article in articles.data" :key="article.id"
      @tap="goToDetail(article.name)"
      :class="$style['article']"
    >
      <image :class="$style['image']" :src="optimizeImage(article.image, 50)"></image>
      <view :class="$style['title']" >{{ article.title }}</view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage } from '@/utils/image'
import ListTable from '@/mixins/ListTable'

export default {
  name: 'Blog',
  mixins: [
    ListTable('articles', { urlRoot: '/shopfront/article/' })
  ],
  data() {
    return {}
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  onReachBottom() {
    this.fetchMore()
  },
  async mounted() {
    this.updateDefaultParams({
      'fields': ['id', 'name', 'title', 'image'].join(',')
    }, { fetch: false })
    this.fetchList()
  },
  methods: {
    optimizeImage,
    goToDetail(articleName) {
      Taro.navigateTo({ url: '/pages/blog/article?name=' + articleName })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page {
  padding: 15px;
}
.article {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}
.image {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}
.title {
  //
}
</style>
