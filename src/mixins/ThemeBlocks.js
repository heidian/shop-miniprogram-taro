import _ from 'lodash'
import Taro from '@tarojs/taro'
import { backgroundImageUrl } from '@/utils/image'
import FeaturedProducts from '@/components/blocks/FeaturedProducts'
import Carousel from '@/components/blocks/Carousel'
import Image from '@/components/blocks/Image'
import Grids from '@/components/blocks/Grids'
import Text from '@/components/blocks/Text'

import getTestPageConfig from './_getTestPageConfig'

const BLOCKS_MAP = {
  'blocks/featured_products': FeaturedProducts,
  'blocks/carousel': Carousel,
  'blocks/image': Image,
  'blocks/grids': Grids,
  'blocks/text': Text
}

export default (propertyName, { pageType, pageName } = {}) => {
  return {
    data() {
      return {
        [propertyName]: []
      }
    },
    methods: {
      async fetchPageConfig() {
        console.log(`get test pageconfig of ${pageType}`)
        const pageConfig = getTestPageConfig(pageType, pageName)
        const blocks = _.cloneDeep(pageConfig['settings_data']['components'])
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
