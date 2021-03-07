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
import Image from '@/components/blocks/Image'
import Grids from '@/components/blocks/Grids'
import Text from '@/components/blocks/Text'

// import getTestPageConfig from './_getTestPageConfig'
// const PREVIEW_THEME_ID = 13390

const BLOCKS_MAP = {
  'blocks/header': Header,
  'blocks/featured_products': FeaturedProducts,
  'blocks/carousel': Carousel,
  'blocks/image': Image,
  'blocks/grids': Grids,
  'blocks/text': Text
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
      const key = (this.pageType && this.pageName) ? `${this.pageType}/${this.pageName}` : this.pageType
      const blocks = this.$store.state.theme.blocksOfPage[key] || []
      return _.map(blocks, (block) => {
        const css = { ...(block.css || {}) }
        if (_.isObject(css.backgroundImage)) {
          css.backgroundImage = backgroundImageUrl(css.backgroundImage, 400)
        }
        _.forEach(['paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft'], (prop) => {
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
      const pageData = await this.$store.dispatch('theme/fetchPage', { pageType, pageName })
      // TODO: 这里返回 pageData 可以取一下 page 的 title 之类的, 这些不存在 store 里
      return pageData
    }
  }
}
