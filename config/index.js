var _ = require('lodash')
var path = require('path')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

const config = {
  projectName: 'mini_heyshop_taro',
  date: '2020-7-27',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 1 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  alias: {
    // ~ 好像被 taro 给强制定义了 (比如 ~taro-ui/xxx.scss), 但找不到在哪, 为了 js 和 scss 引入方式统一, 就都用 @
    // '~': resolve('src')
    '@/components': resolve('src/components'),
    '@/utils': resolve('src/utils'),
    '@/mixins': resolve('src/mixins'),
    '@/styles': resolve('src/styles'),
  },
  sass: {
    resource: [
      // 'src/styles/main.scss'
    ],
    projectDirectory: path.resolve(__dirname, '..')
  },
  plugins: [],
  defineConstants: {
  },
  copy: {
    patterns: [
      // { from: 'node_modules/lodash/lodash.min.js', to: 'dist/npm/lodash/lodash.min.js' },
      { from: 'src/ext.json', to: 'dist/ext.json' },
      { from: 'src/sitemap.json', to: 'dist/sitemap.json' }
    ],
    options: {}
  },
  framework: 'vue',
  mini: {
    webpackChain(chain, webpack) {
      // https://cnodejs.org/topic/5846b2883ebad99b336b1e06
      // 这么做是可以的, 再配合上面的 copy, 但是要处理一下 global 变量
      // chain.externals({lodash: 'require("npm/lodash/lodash.min.js")'})
      chain.plugin('lodash-webpack-plugin').use(
        require('lodash-webpack-plugin')
      ).init((Plugin, args) => {
        return new Plugin({
          'paths': true,
          // 支持 deep path, 比如 _.get(obj, 'a.b.c')
          'collections': true,
          // 支持 collection 方法, 比如 _.forEach 不光可以循环一个 Array 还可以循环一个 Object, 不然 Object 就只能用 _.forIn
          'shorthands': true
          // 支持 shorthands, 也就是 _.property 或 _.matchesProperty 这种, 这样在 _.find 的时候, 可以传一个 object 作为搜索条件
        })
      });
      chain.merge({
        optimization: {
          splitChunks: {
            cacheGroups: {
              lodash: {
                name: 'lodash',
                priority: 1000,
                test(module) {
                  return /node_modules[\\/]lodash/.test(module.context)
                }
              }
            }
          }
        }
      })
      const value0 = { ...chain.toConfig().module.rules[1].oneOf[0].use }
      const value1 = { ...chain.toConfig().module.rules[1].oneOf[1].use }
      chain.module.rule('scss').oneOf(2)
        .use(0).loader(value1[0].loader).options(value1[0].options).end()
        .use(1).loader(value1[1].loader).options(value1[1].options).end()
        .use(2).loader(value1[2].loader).options(value1[2].options).end()
        .use(3).loader(value1[3].loader).options(value1[3].options).end()
      chain.module.rule('scss').oneOf(1).resourceQuery(/module/)
        .use(0).loader(value0[0].loader).options(value0[0].options).end()
        .use(1).loader(value0[1].loader).options(value0[1].options).end()
        .use(2).loader(value0[2].loader).options(value0[2].options).end()
        .use(3).loader(value0[3].loader).options(value0[3].options).end()
      // chain.module.rule('scss').oneOf(1).use('1').loader('css-loader').tap((options) => {
      //   return {
      //     ...options,
      //     // modules: true,
      //     modules: {
      //       localIdentName: "[name]__[local]___[hash:base64:5]",
      //     }
      //   }
      // })
      // console.log(chain.toConfig().module.rules[1].oneOf)
    },
    commonChunks(commonChunks) {
      commonChunks.push('lodash')
      return commonChunks
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
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
        config: {}
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
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
