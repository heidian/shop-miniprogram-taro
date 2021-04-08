import _ from 'lodash'
import extConfig from '../ext.json'
const DEBUG_SHOP_NAME = _.get(extConfig, 'ext.shopname') || ''

module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    API_URL: `"${process.env.API_URL || 'https://heidianapi.com/api/'}"`,
    DEBUG_SHOP_NAME: `"${process.env.DEBUG_SHOP_NAME || DEBUG_SHOP_NAME}"`
  },
  mini: {},
  h5: {}
}
