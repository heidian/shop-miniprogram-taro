import _ from 'lodash'

function getTestPageConfig() {
  return {
    "settings_data": {
      "components": [{
        "name": "blocks/carousel",
        "style": {
          "paddingTop": "10%",
          "paddingRight": "5%",
          "paddingBottom": "10%",
          "paddingLeft": "5%",
          "backgroundColor": "#000000"
        },
        "settings_data": {
          //
        }
      }, {
        "name": "blocks/image",
        "style": {
          "paddingTop": "15px",
          "paddingRight": "15px",
          "paddingBottom": "15px",
          "paddingLeft": "15px"
        },
        "settings_data": {
          "image": {
            "src": "https://up.img.heidiancdn.com/o_1eepfu0ou1avbgh2u4v1g9r150l0G1093.jpeg"
          }
        }
      }, {
        "name": "blocks/carousel",
        "style": {
          "padding": "30px",
          "backgroundColor": "#FF0000"
        },
        "settings_data": {
          //
        }
      }, {
        "name": "blocks/text",
        "style": {
          "padding": "20px 50px",
          "color": "#0000FF",
          "textAlign": "center",
          "backgroundColor": "#FFFFFF"
        },
        "settings_data": {
          "text": {
            "value": "这是一个文字板块"
          }
        }
      }]
    },
    "template": "__COMPONENTS__",
    "layout": "layouts/default"
  }
}

import Carousel from '@/components/blocks/Carousel'
import Image from '@/components/blocks/Image'
import Text from '@/components/blocks/Text'

const BLOCKS_MAP = {
  'blocks/carousel': Carousel,
  'blocks/image': Image,
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
          block.componentClass = BLOCKS_MAP[block.name]
        })
        this[propertyName] = blocks
      }
    }
  }
}
