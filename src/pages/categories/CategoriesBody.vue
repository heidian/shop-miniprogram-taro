<template>
  <swiper
    :class="$style['swiper']"
    :current="current"
    :vertical="true"
    easing-function="easeInOutCubic"
    @animationfinish="onAnimationfinish"
  >
    <swiper-item
      v-for="item in items" :key="item.id"
      :class="{
        [$style['item']]: true
      }"
    >
      <scroll-view
        :class="$style['itemView']"
        :scroll-x="false"
        :scroll-y="true"
        :enhanced="true"
        :scroll-anchoring="true"
        :show-scrollbar="false"
      >
        <view
          :class="$style['categoryImage']"
          :style="{'backgroundImage': backgroundImageUrl(item.image, 400)}"
          @tap="onTapItem(item.id)"
        ></view>
        <view :class="$style['subCategoryWrapper']">
          <view v-for="subItem in item.children" :key="subItem.id" :class="$style['subItem']"
            @tap="onTapSubItem(subItem.id)"
          >
            <view
              :class="$style['childImage']"
              :style="{'backgroundImage': backgroundImageUrl(subItem.image, 100)}"></view>
            <view :class="$style['childTitle']">{{ subItem.title }}</view>
          </view>
        </view>
      </scroll-view>
    </swiper-item>
  </swiper>
</template>
<script>

import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  props: {
    current: Number
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapState('categories', {
      items: (state) => state.data
    })
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    onTapSubItem(id) {
      Taro.navigateTo({ url: `/pages/search/index?category=${id}` })
    },
    onTapItem(id) {
      Taro.navigateTo({ url: `/pages/search/index?category=${id}` })
    },
    onAnimationfinish(e) {
      const index = e.detail.current
      // Taro.vibrateShort()
      this.$emit('change:current', index)
    }
  },
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
.swiper {
  width: 100%;
  height: 100%;
}
.item {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: 15px;
}
.itemView {
  width: 100%;
  height: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}
.categoryImage {
  display: block;
  margin-left: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
  padding-top: 33.333333%;
  // background-color: orange;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 4px;
}
.subCategoryWrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
}
.subItem {
  width: percentage(1/3);
  padding: 8px;
}
.childImage {
  width: 100%;
  padding-top: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 4px;
}
.childTitle {
  font-size: 12px;
  text-align: center;
  margin-top: 4px;
  line-height: 1.5;
}
</style>

