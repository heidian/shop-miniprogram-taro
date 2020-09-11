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
    DEFAULT_AVATAR: "'https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png'"
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

      /* 加一条 scss loader, 支持 vuejs 中 <style lang="scss" module> 这种形式的 css modules */
      const ruleStore = chain.module.rule('scss').oneOfs.store
      const oneOf0 = ruleStore.get('0')  // import 'xxx.module.scss' 方式的 css modules 配置, 下面的 postcss.cssModules.enable 开启后会自动生成
      const oneOf1 = ruleStore.get('1')  // 其他 scss 文件, 常规的 scss loader
      ruleStore.set('2', oneOf1)
      // 删掉确保下面的 chain.module.rule('scss').oneOf('1') 会创建一个新的对象, 避免 resourceQuery 操作影响了一个共用的 store
      ruleStore.delete('1')
      const usesStore = oneOf0.uses.store
      const uses = _.map(['0', '1', '2', '3'], key => {
        const store = usesStore.get(key).store
        return {
          loader: store.get('loader'),
          options: _.cloneDeep(store.get('options'))
        }
      })
      chain.module.rule('scss').oneOf('1').resourceQuery(/module/)
        .use(0).loader(uses[0]['loader']).options(uses[0]['options']).end()
        .use(1).loader(uses[1]['loader']).options(uses[1]['options']).end()
        .use(2).loader(uses[2]['loader']).options(uses[2]['options']).end()
        .use(3).loader(uses[3]['loader']).options(uses[3]['options']).end()
      // const localIdentName = '[path][name]__[local]___[hash:base64:5]'
      // chain.module.rule('scss').oneOf('0').use('1').loader('css-loader').tap((options) => {
      //   return { ...options, modules: { localIdentName } }
      // })
      // chain.module.rule('scss').oneOf('1').use('1').loader('css-loader').tap((options) => {
      //   return { ...options, modules: { localIdentName } }
      // })
      // console.log(chain.toConfig().module.rules[1].oneOf[0])
      // console.log(chain.toConfig().module.rules[1].oneOf[1])
      // console.log(chain.toConfig().module.rules[1].oneOf[2])
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
