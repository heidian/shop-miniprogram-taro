var path = require('path')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

const config = {
  projectName: 'erp_taro_wxapp',
  date: '2020-7-27',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  alias: {
    // ~ 好像被 taro 给强制定义了 (比如 ~taro-ui/xxx.scss), 但找不到在哪, 为了 js 和 scss 引入方式统一, 就都用 @
    // '~': resolve('src')
    '@/components': resolve('src/components'),
    '@/utils': resolve('src/utils'),
    '@/mixins': resolve('src/mixins'),
  },
  sass: {
    resource: [
      'src/styles/_variables.scss',
      'src/styles/_mixins.scss',
      'src/styles/app.scss'
    ],
    projectDirectory: path.resolve(__dirname, '..')
  },
  plugins: [],
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'vue',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
