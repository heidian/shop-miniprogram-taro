<template>
  <view :class="$style['page']">
    <view :class="$style['blackHeader']"> <!-- 顶部个人信息 -->
      <view :class="$style['profileWrapper']">
        <template v-if="customer.isAuthenticated">
          <image :class="$style['avatar']" mode="aspectFill"
            :src="optimizeImage(customer.data.avatar || DEFAULT_AVATAR, 50)"></image>
          <view>
            <view :class="$style['fullNameAndLevel']">
              <view :class="$style['fullName']">{{ customer.data.full_name || '未命名' }}</view>
              <view :class="$style['levelTitle']">
                <text class="el-icon-star-on"></text>{{ partnerProfile.data.level_title }}
              </view>
              <!-- <navigator
                :class="$style['wechatIdLink']" hover-class="none"
                url="/pages/profile/wechat" open-type="navigate"
              >填写微信号</navigator> -->
            </view>
            <view :class="$style['referralCodeWrapper']">
              <text :class="$style['referralCode']">邀请码: {{ customer.data.referral_code }}</text>
              <button :class="['button', 'button--mini', $style['btnCopy']]" @tap="copyReferralCode">复制</button>
            </view>
          </view>
        </template>
        <template v-else>
          <image :class="$style['avatar']" mode="aspectFill" :src="DEFAULT_AVATAR"></image>
          <navigator url="/pages/login/index" :class="$style['loginLink']" hover-class="none">去登录</navigator>
        </template>
        <!-- <image
          :class="$style['heyshop']" mode="widthFix"
          src="https://up.img.heidiancdn.com/o_1eiojj5s632c1urj1a6u1jn01l330shop3x.png"
        >HeyShop</image> -->
      </view>
      <!-- url="/pages/blog/article?name=partner-intro" -->
      <navigator :class="$style['growthProgressWrapper']" url="/pages/partner/growth-value-changes" hover-class="none">
        <view :class="$style['lightText']">当前成长值{{ growthValue }}（达1000即可升级）</view>
        <view :class="$style['lightText']">{{ growthValue }}/1000 <text class="el-icon-arrow-right"></text></view>
        <view :class="$style['progressBar']" v-if="growthValue < 1000">
          <view :class="$style['progressBarInner']" :style="{'width':`${growthValue/10}%`}"></view>
        </view>
      </navigator>
      <view v-if="growthValue < 1000" :class="[$style['toBePartnerWrapper'], $style['goldBg']]">
        <view>
          <view><text style="font-size: 1.8em; font-weight: bold;">5880.0</text> 元</view>
          <view :class="$style['lightText']">预计每年为您省赚</view>
        </view>
        <button
          class="button button--dark button--round button--small"
          style="color: #e6caa5;" @tap="scrollToProducts"
        >成为国货大使</button>
      </view>
      <view v-else :class="[$style['isPartnerWrapper'], $style['goldBg']]">
        <text v-if="!partnerLevel">当前已达国货大使申请条件</text>
        <text v-else>HeyShop国货大使</text>
        <text style="margin: 0 0.5em;"> | </text>
        <text>{{ partnerProfile.data.ends_at|date }}到期</text>
      </view>
      <navigator :class="$style['talentLink']" url="/pages/partner/talent">
        <image :class="$style['talentLinkImage']" src="https://up.img.heidiancdn.com/o_1eh4kgtf149j1sk5bih1rpk1rfb0.png" mode="aspectFit"></image>
        推广帮助
      </navigator>
    </view>
    <view :class="$style['whiteSection']"> <!-- 国货大使攻略 -->
      <navigator url="/pages/blog/article?name=partner-intro" hover-class="none">
        <image
          style="height: 80px; display: block; width: 100%;" mode="aspectFit"
          src="https://up.img.heidiancdn.com/o_1eialsc45bu093fkfor2q1l2d0copy3x.png"
        ></image>
      </navigator>
      <view :class="$style['sectionTitle']">
        <text :class="$style['sectionTitleText']">国货大使权益</text>
      </view>
      <view :class="$style['pros']">
        <view
          v-for="(item, index) in pros" :key="index" :class="$style['proItem']"
          :style="{'backgroundImage': backgroundImageUrl(item.image, 60)}"
        >
          <view>{{ item.title }}</view>
          <view :class="$style['lightText']">{{ item.description }}</view>
        </view>
      </view>
      <view :class="$style['sectionTitle']">
        <text :class="$style['sectionTitleText']">获取成长值</text>
      </view>
      <view :class="$style['todos']">
        <view
          v-for="(item, index) in todos" :key="index" :class="$style['todoItem']"
          :style="{'backgroundImage': backgroundImageUrl(item.image, 60)}"
        >
          <view>
            <text>{{ item.title }}</text>
            <text :class="[$style['todoTag'], $style['goldBg']]">{{ item.tag }}</text>
          </view>
          <view :class="$style['lightText']" style="margin-top: 0.2em;">{{ item.description }}</view>
          <!-- <button class="button button--mini button--round button--dark">去完成</button> -->
          <navigator :url="item.url" hover-class="none" :class="$style['todoAction']">{{ item.actionText }}</navigator>
        </view>
      </view>
    </view>
    <view :class="$style['productsWrapper']">
      <!-- <image
        :class="$style['productsHeader']" mode="heightFix"
        src="https://up.img.heidiancdn.com/o_1eib6m5pal6mv2n6up247mls0up413x.png"
      ></image> -->
      <view :class="$style['productsHeader']">达人升级优选商品推荐</view>
      <view v-for="(product) in products.data" :key="product.id" :class="$style['productGrid']">
        <view :class="$style['productItem']" @tap="goToProduct(product.name)">
          <view :class="$style['productImageWrapper']" :style="{'backgroundImage': backgroundImageUrl(product.image, 200)}">
            <view
              :class="[$style['productGrowthValue'], $style['goldBg']]"
              v-if="product.metafields.substores && product.metafields.substores.growth_value"
            >
              <text class="el-icon-star-on"></text>成长值 {{ product.metafields.substores.growth_value }}
            </view>
          </view>
          <view :class="$style['productTitle']">{{ product.title }}</view>
          <view :class="$style['productFooter']">
            <price
              :highlight="false" :keepZero="false"
              :price="product.price" :compareAtPrice="product.compare_at_price"
            ></price>
            <button class="button button--dark button--round button--mini" @tap="goToProduct(product.name)">
              <text class="el-icon-shopping-cart"></text>去购买
            </button>
          </view>
        </view>
      </view>
      <view v-if="hasMore" :class="$style['loadMore']"><text class="el-icon-more"></text></view>
    </view>
    <view :class="$style['activationBottom']" v-if="growthValue >= 1000 && !partnerLevel">
      <button class="button button--dark button--small" style="color: #e6caa5;" @tap="goToActivate">免费激活国货大使身份</button>
    </view>
  </view>
</template>

<script>
import _ from 'lodash'
import Taro from '@tarojs/taro'
import { mapState } from 'vuex'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl, DEFAULT_AVATAR } from '@/utils/image'
import ListTable from '@/mixins/ListTable'
import Price from '@/components/Price'

export default {
  name: 'Partner',
  mixins: [
    ListTable('products', { urlRoot: '/shopfront/product/' })
  ],
  components: {
    Price,
  },
  data() {
    return {
      DEFAULT_AVATAR,
      achievements: {},
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
      }]
    }
  },
  computed: {
    ...mapState(['customer', 'partnerProfile']),
    partnerLevel() {
      return +this.partnerProfile.data.level || 0
    },
    growthValue() {
      return +this.partnerProfile.data.growth_value || 0
    },
    hasMore() {
      const { page, pageSize, count } = this.products
      return page * pageSize < count
    },
    todos() {
      return [{
        image: 'https://up.img.heidiancdn.com/o_1eiaps8ae1mnu14kf1jlh9m51pof0copy3x.png',
        title: '完善微信资料',
        tag: '+50成长值',
        url: '/pages/profile/wechat',
        description: '完善微信资料即可获得50成长值',
        actionText: this.achievements['complete_wechat_id'] ? '已完成' : '去完善',
      }, {
        image: 'https://up.img.heidiancdn.com/o_1eiapsmke88a8s2bhmp91t3n0copy3x.png',
        title: '完善个人信息',
        tag: '+50成长值',
        url: '/pages/profile/edit',
        description: '完善个人信息即可获得50成长值',
        actionText: this.achievements['complete_personal_profile'] ? '已完成' : '去完善',
      }, {
        image: 'https://up.img.heidiancdn.com/o_1eiapt3h71ec11mhth2420e1er90copy3x.png',
        title: '购买任意商品',
        tag: '+相应成长值',
        url: '/pages/search/index',
        description: '购买任意商品，每笔有效订单均可获得相应成长值',
        actionText: '去购买',
      }]
    }
  },
  created() {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#020202'
    })
    Taro.setBackgroundColor({
      backgroundColorTop: '#020202',
      backgroundColor: '#020202',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  async mounted() {
    API.get('/shopfront/collection/', {
      params: { name: 'high-growth-value' }
    }).then((res) => {
      const collectionId = _.get(res.data, 'results[0].id')
      if (collectionId) {
        this.updateDefaultParams({
          fields: ['id', 'name', 'title', 'description', 'image', 'price', 'compare_at_price', 'metafields'].join(','),
          collection: collectionId
        }, { fetch: false })
        this.fetchList()
      }
    })
  },
  onShow() {
    // 下面做了 throttle, 不会频繁获取
    if (this.customer.isAuthenticated) {
      this.throttleFetchCustomer()
      this.throttleFetchAchievement()
    }
  },
  onReachBottom() {
    // 高成长值商品不多, 不限制页数了
    // const { data, page, pageSize, count } = this.products
    // if (data.length < 30 && page * pageSize < count) {
    if (this.hasMore) {
      this.fetchMore()
    } else {}
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    copyReferralCode() {
      const content = this.customer.data.referral_code
      Taro.setClipboardData({ data: content }).then(() => {
        Taro.showToast({ title: '复制成功' })
      }).catch(err => {
        Taro.showToast({ title: '复制失败' })
      })
    },
    throttleFetchCustomer: _.throttle(function() {
      // this.$store.dispatch('customer/getCustomer')  // 目前看起来不需要
      this.$store.dispatch('partnerProfile/retrieve')
    }, 5000, { leading: true, trailing: false }),
    throttleFetchAchievement: _.throttle(function() {
      API.get('/substores/partners/growth_value_change/', {
        params: { kind: 'achievement' }
      }).then((res) => {
        const achievements = {}
        _.forEach(res.data.results, (item) => achievements[item.achievement_name] = true)
        this.achievements = achievements
      })
    }, 5000, { leading: true, trailing: false }),
    scrollToProducts() {
      const className = this.$style['productsWrapper']
      Taro.pageScrollTo({
        selector: `.${className}`,
        duration: 350
      })
    },
    goToLogin() {
      Taro.navigateTo({ url: '/pages/login/index' })
    },
    goToProduct(productName) {
      Taro.navigateTo({ url: `/pages/product/index?name=${productName}` })
    },
    goToActivate() {
      Taro.navigateTo({ url: '/pages/partner/activate' })
    }
  }
}
</script>

<style lang="scss" module>
@import './index.scss'
</style>
