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
import FeaturedProducts from '@/components/blocks/FeaturedProducts'
import Carousel from '@/components/blocks/Carousel'
import Image from '@/components/blocks/Image'
import Grids from '@/components/blocks/Grids'
import Text from '@/components/blocks/Text'

// import getTestPageConfig from './_getTestPageConfig'

const PREVIEW_THEME_ID = 13390
const BLOCKS_MAP = {
  'blocks/featured_products': FeaturedProducts,
  'blocks/carousel': Carousel,
  'blocks/image': Image,
  'blocks/grids': Grids,
  'blocks/text': Text
}

export default (propertyName) => {
  return {
    data() {
      return {
        [propertyName]: []
      }
    },
    methods: {
      async fetchPageConfig(pageType, pageName) {
        console.log(`get test pageconfig of ${pageType}`)
        // const pageConfig = getTestPageConfig(pageType, pageName)
        // const blocks = _.cloneDeep(pageConfig['settings_data']['components'])
        const params = {
          'fields[shop]': 'id',
          'fields[page]': 'pageconfig',
          'scope': 'miniprogram',
          'preview_theme_id': PREVIEW_THEME_ID,  // 上线以后要删掉
          'page_type': pageType
        }
        if (pageName) {
          params['name'] = pageName
        }
        const res = await API.get('/shopfront/shop/', { params })
        const blocks = _.get(res.data, 'page.pageconfig.settings_data.components')
        _.forEach(blocks, block => {
          if (_.isObject(block.css.backgroundImage)) {
            block.css.backgroundImage = backgroundImageUrl(block.css.backgroundImage, 600)
          }
          _.forEach(['paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft'], (prop) => {
            if (block.css[prop] && /^\d+(\.\d+)?(px)?$/.test(block.css[prop])) {
              block.css[prop] = Taro.pxTransform(block.css[prop])
            }
          })
          block.componentClass = BLOCKS_MAP[block.name]
        })
        this[propertyName] = blocks
      }
    }
  }
}
