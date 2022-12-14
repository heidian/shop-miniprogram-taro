/*
 * component 下面的 css 只支持 padding 和 background !!
 * 建站工具下面会支持写如板块根节点 css 属性, 建站工具会分开存储 padding 四个方向的值
 * 现在手写 padding 也一定要分成 paddingTop, paddingBottom, paddingRight, paddingLeft 写, 不然不方便转换成 rpx
 * backgroundImage 的写法还是 { src, metafield } 的格式, 而不是 css 的 url() 的写法
 */

import _ from 'lodash'
import Taro from '@tarojs/taro'
import { API } from '@/utils/api'
import { backgroundImageUrl } from '@/utils/image'
import Header from '@/components/blocks/Header'
import FeaturedProducts from '@/components/blocks/FeaturedProducts'
import Carousel from '@/components/blocks/Carousel'
import Accordion from '@/components/blocks/Accordion'
import Image from '@/components/blocks/Image'
import Video from '@/components/blocks/Video'
import Grids from '@/components/blocks/Grids'
// import Text from '@/components/blocks/Text'
import Marquee from '@/components/blocks/Marquee'
import RichText from '@/components/blocks/RichText'
import Coupons from '@/components/blocks/Coupons'
import ProductSingleMain from '@/components/blocks/product/ProductSingleMain'
import ProductSingleImages from '@/components/blocks/product/ProductSingleImages'
import ProductSingleOptions from '@/components/blocks/product/ProductSingleOptions'
import ProductSingleAccessories from '@/components/blocks/product/ProductSingleAccessories'
import ProductSingleBodyHtml from '@/components/blocks/product/ProductSingleBodyHtml'
import ProductSingleRelated from '@/components/blocks/product/ProductSingleRelated'
import ProductSingleReviews from '@/components/blocks/product/ProductSingleReviews'
import PageSingleBodyHtml from '@/components/blocks/PageSingleBodyHtml'
import LoginForm from '@/components/blocks/api/LoginForm'

import TezignBanner from '@/components/blocks/misc/TezignBanner'
import JoyberryProductSingleColors from '@/components/blocks/misc/JoyberryProductSingleColors'
import JoyberryProductSingleReviews from '@/components/blocks/misc/JoyberryProductSingleReviews'

// import getTestPageConfig from './_getTestPageConfig'
// const PREVIEW_THEME_ID = 13390

const BLOCKS_MAP = {
  'blocks/header': Header,
  'blocks/featured_products': FeaturedProducts,
  'blocks/carousel': Carousel,
  'blocks/accordion': Accordion,
  'blocks/image': Image,
  'blocks/video': Video,
  'blocks/grids': Grids,
  // 'blocks/text': Text,
  'blocks/marquee': Marquee,
  'blocks/rich_text': RichText,
  'blocks/coupons': Coupons,
  'blocks/product_single_main': ProductSingleMain,
  'blocks/product_single_images': ProductSingleImages,
  'blocks/product_single_options': ProductSingleOptions,
  'blocks/product_single_accessories': ProductSingleAccessories,
  'blocks/product_single_body_html': ProductSingleBodyHtml,
  'blocks/product_single_related': ProductSingleRelated,
  'blocks/product_single_reviews': ProductSingleReviews,
  'blocks/page_single_body_html': PageSingleBodyHtml,
  'blocks/login_form': LoginForm,

  'blocks/tezign_banner': TezignBanner,
  'blocks/joyberry_product_single_colors': JoyberryProductSingleColors,
}

if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
  BLOCKS_MAP['blocks/tezign_banner'] = Image
}

export default {
  data() {
    return {
      pageType: '',
      pageName: '',
    }
  },
  computed: {
    blocks() {
      if (this.$store.state.config.shopname === 'joyberry') {
        BLOCKS_MAP['blocks/product_single_reviews'] = JoyberryProductSingleReviews
      }
      const key = (this.pageType && this.pageName) ? `${this.pageType}/${this.pageName}` : this.pageType
      const blocks = _.filter(this.$store.state.theme.blocksOfPage[key] || [], (block) => !block.hidden)
      return _.map(blocks, (block, index) => {
        const css = { ...(block.css || {}) }
        if (_.isObject(css.backgroundImage)) {
          css.backgroundImage = backgroundImageUrl(css.backgroundImage, 400)
        }
        _.forEach([
          'paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft',
          'marginTop', 'marginBottom', 'marginRight', 'marginLeft',
          'borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'borderLeftWidth',
        ], (prop) => {
          if (css[prop] && /^\d+(\.\d+)?(px)?$/.test(css[prop])) {
            css[prop] = Taro.pxTransform(css[prop])
          }
        })
        const componentClass = BLOCKS_MAP[block.name]
        return {
          ...block, css, componentClass
        }
      })
    }
  },
  methods: {
    async fetchPageConfig(pageType, pageName) {
      this.pageType = pageType
      this.pageName = pageName
      const data = await this.$store.dispatch('theme/fetchPage', { pageType, pageName })
      // TODO: 这里返回 data 可以取一下 page 和 shop 的 title 之类的, 这些不存在 store 里
      return data
    }
  }
}
