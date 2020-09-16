<template>
  <view :class="$style['page']">
    <view :class="$style['blackHeader']">
      <view v-if="customer.isAuthenticated" :class="$style['profileWrapper']">
        <image :class="$style['avatar']" :src="optimizeImage(customer.data.avatar, 50)"></image>
        <view>
          <view>{{ customer.data.full_name }}</view>
          <view :class="$style['lightText']">
            <text class="el-icon-star-on"></text>
            {{ /*partner.level*/ '普通用户' }}
          </view>
        </view>
      </view>
      <view v-else @tap="goToLogin">去登录</view>
      <view :class="$style['growthValueWrapper']">
        <view :class="$style['lightText']" style="margin-left: 0.5em;">当前成长值100（达1000即可升级）</view>
        <view :class="$style['lightText']" style="margin-right: 0.5em;">100/1000</view>
        <view :class="$style['progressBar']">
          <view :class="$style['progressBarInner']"></view>
        </view>
      </view>
      <view :class="$style['ctaWrapper']">
        <view>
          <view><text style="font-size: 1.8em; font-weight: bold;">5880.0</text> 元</view>
          <view :class="$style['lightText']">预计每年为您省赚</view>
        </view>
        <button class="button--round button--small">成为合伙人</button>
      </view>
    </view>
    <!-- 国货大使攻略 -->
    <image
      style="height: 80px; display: block; width: auto; margin: 20px 10px;" mode="aspectFit"
      src="https://up.img.heidiancdn.com/o_1eialsc45bu093fkfor2q1l2d0copy3x.png"
    ></image>
    <view :class="$style['sectionTitle']">合伙人权益</view>
    <view :class="$style['pros']">
      <view
        v-for="(item, index) in pros" :key="index" :class="$style['proItem']"
        :style="{'backgroundImage': backgroundImageUrl(item.image, 60)}"
      >
        <view>{{ item.title }}</view>
        <view :class="$style['lightText']">{{ item.description }}</view>
      </view>
    </view>
    <view :class="$style['sectionTitle']">获取成长值</view>
    <view :class="$style['todos']">
      <view
        v-for="(item, index) in todos" :key="index" :class="$style['todoItem']"
        :style="{'backgroundImage': backgroundImageUrl(item.image, 60)}"
      >
        <view>
          <text>{{ item.title }}</text>
          <text :class="$style['todoTag']">{{ item.tag }}</text>
        </view>
        <view :class="$style['lightText']" style="margin-top: 0.2em;">{{ item.description }}</view>
        <button class="button--round">去完成</button>
      </view>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  name: 'Partner',
  components: {},
  data() {
    return {
      pros: [{
        image: 'https://up.img.heidiancdn.com/o_1eiama15ugei6gj0p2cs9tf0oup53x.png',
        title: '自购省钱',
        description: '高质低价超划算'
      }, {
        image: 'https://up.img.heidiancdn.com/o_1eiam9j0c1bc3b62r43b719i80oup53x.png',
        title: '分享多奖',
        description: '多分享多奖励'
      }, {
        image: 'https://up.img.heidiancdn.com/o_1eiam8v0m1dli1vm61k1217uo1dj10oup53x.png',
        title: '畅享包邮',
        description: '5次包邮不凑单'
      }, {
        image: 'https://up.img.heidiancdn.com/o_1eiam8h8elbtbkqqp81rnc10330oup53x.png',
        title: '专属折扣',
        description: '百元优惠月月领'
      }],
      todos: [{
        image: 'https://up.img.heidiancdn.com/o_1eiaps8ae1mnu14kf1jlh9m51pof0copy3x.png',
        title: '完善微信资料',
        tag: '+50成长值',
        description: '完善微信资料即可获得50成长值'
      }, {
        image: 'https://up.img.heidiancdn.com/o_1eiapsmke88a8s2bhmp91t3n0copy3x.png',
        title: '完善个人信息',
        tag: '+50成长值',
        description: '完善个人信息即可获得50成长值'
      }, {
        image: 'https://up.img.heidiancdn.com/o_1eiapt3h71ec11mhth2420e1er90copy3x.png',
        title: '购买任意商品',
        tag: '+相应成长值',
        description: '购买任意商品，每笔有效订单均可获得相应成长值'
      }]
    }
  },
  computed: {
    ...mapState(['customer'])
  },
  created() {
    Taro.setBackgroundColor({
      backgroundColor: '#020202',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    goToLogin() {
      Taro.navigateTo('/pages/login/index')
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';

.lightText {
  opacity: 0.7;
  font-size: 0.85em;
}

/* 黑色顶部区域 */
.blackHeader {
  background-color: #020202;
  color: #fff;
  padding: 20px;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    display: block;
    left: 50%;
    margin-left: -8px;
    bottom: -6px;
    height: 16px;
    width: 16px;
    transform: rotate(45deg);
    background-color: #020202;
  }
}
.profileWrapper {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  margin-right: 10px;
  display: block;
}
.growthValueWrapper {
  margin: 20px auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
}
.progressBar {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background-color: #272727;
  overflow: hidden;
  margin-top: 10px;
}
.progressBarInner {
  height: 100%;
  width: 20%;
  background-image: linear-gradient(104deg, #eac893, #ddb47a 81%);
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
}
.ctaWrapper {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 18px;
  border-radius: 4px;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(109deg, #e8cca7, #edd6b8 53%, #e6caa5 83%);
  color: #5c411a;
  button {
    color: #e6caa5;
    background-color: #020202;
  }
}

/* 合伙人权益和任务 */
.sectionTitle {
  padding: 20px 25px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
.pros {
  @include clearfix();
  padding: 0 25px;
}
.proItem {
  float: left;
  width: 50%;
  white-space: nowrap;
  line-height: 20px;
  padding: 5px 5px 5px 55px;
  margin-bottom: 15px;
  background-size: auto 44px;
  background-position: top left;
  background-repeat: no-repeat;
  font-size: 1.1em;
}
.todos {
  padding: 0 25px;
}
.todoItem {
  padding: 5px 80px 5px 55px;
  margin-bottom: 15px;
  background-size: auto 44px;
  background-position: top left;
  background-repeat: no-repeat;
  position: relative;
  button {
    position: absolute;
    right: 0;
    top: 10px;
    padding: 2px 12px;
    border-radius: 12px;
    font-size: 12px;
    color: #fff;
    background-color: #020202;
  }
}
.todoTag {
  display: inline-block;
  border-radius: 2px;
  background-image: linear-gradient(107deg, #e8cca7, #edd6b8 52%, #e6caa5 83%);
  color: #5c411a;
  font-size: 11px;
  font-weight: bold;
  padding: 0 5px;
}
</style>
