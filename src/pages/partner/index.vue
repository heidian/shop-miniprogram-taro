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
    <view :class="$style['productsWrapper']">
      <view v-for="(product, index) in products.data" :key="product.id" :class="$style['productGrid']">
        <view :class="$style['productItem']" @tap="goToProduct(product.name)">
          <view :class="$style['productImageWrapper']" :style="{'backgroundImage': backgroundImageUrl(product.image, 200)}">
            <view :class="$style['productGrowthValue']">
              <text class="el-icon-star-on"></text>成长值 900
            </view>
          </view>
          <view :class="$style['productTitle']">{{ product.title }}</view>
          <view :class="$style['productFooter']">
            <price
              :highlight="false" :keepZero="false"
              :price="product.price" :compareAtPrice="product.compare_at_price"
            ></price>
            <button class="button--round" @tap="goToProduct(product.name)">
              <text class="el-icon-shopping-cart"></text>去购买
            </button>
          </view>
        </view>
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
import ListTable from '@/mixins/ListTable'
import Price from '@/components/Price'

export default {
  name: 'Partner',
  mixins: [
    ListTable('products', { urlRoot: '/shopfront/product/' })
  ],
  components: {
    Price
  },
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
  async mounted() {
    this.updateDefaultParams({
      fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price'].join(',')
    }, { fetch: false })
    await this.fetchList()
  },
  onReachBottom() {
    const { data, page, pageSize, count } = this.products
    if (data.length < 30 && page * pageSize < count) {
      this.fetchMore()
    } else {}
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    goToLogin() {
      Taro.navigateTo('/pages/login/index')
    },
    goToProduct(productName) {
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    }
  }
}
</script>

<style lang="scss" module>
@import './index.scss'
</style>
