## HeyShop 商城 Taro 小程序

### 常见问题

#### 组件引入顺序
如果两个组件都有 style, 比如组件 A 和 B 组件, 然后在有两个页面 X 和 Y 都用到了组件 A 和 B, 但是 X 和 Y 组件中引入 A 和 B 顺序不同, 会出现类似下面的错误

```
chunk common [mini-css-extract-plugin]
Conflicting order between:
  * css ./node_modules/css-loader/dist/cjs.js??ref--1-oneOf-2-1!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??postcss!./node_modules/sass-loader/dist/cjs.js??ref--1-oneOf-2-3!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Price.vue?vue&type=style&index=0&lang=scss&
  * css ./node_modules/css-loader/dist/cjs.js??ref--1-oneOf-2-1!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??postcss!./node_modules/sass-loader/dist/cjs.js??ref--1-oneOf-2-3!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DrawerBottom.vue?vue&type=style&index=0&lang=scss&
```

原因是 css-extract-plugin 会尝试把被引用多次的组件样式统一放进一个单独的文件里, 因为样式的顺序是不能被忽略的, 这个 css-extract-plugin 会尝试按照组件引入顺序决定谁的样式放在前面, 这样就无法确定 A 和 B 的顺序了

解决办法是, 尽量确保组件在不同页面被引入的顺序是一样的, 当然也可以忽略这个错误(组件样式的顺序对我们来说并不重要), 网上有方法可以配置忽略这个错误


#### CSS Modules 的使用方法
有两种方式使用 CSS Modules

一个是在 vue 文件里的 style 上加 module, 然后 style 里面的一个 .className 可以直接在 template 里通过 $style[className] 引用

另一个是在 script 里面引入 scss, 按照 config/index.js 的配置, 文件名的格式得是 xxx.module.scss 才会被处理成 css modules. 比如 `import styles from './xxx.module.scss'`, 然后需要把 styles 放进 data 里才能在 template 里面使用

第二种方法更适合 React, 在 Vue 中还是用第一种. 第一种方式 Taro 默认没有实现, 我们自己修改了 config/index.js 文件


#### WxParse
参考了这个项目 https://github.com/NervJS/taro-sample-weapp/tree/vue/src/pages
Vue 的 template 和小程序原生的 template 标签重名了, 所以要用 WxParse 必须使用小程序原生组件来实现, 事实上这样实现反而简单
WxParse 的小程序自定义组件定义在 components/wxParse/index.js
并且在 product 页面的 index.config.js 里面通过 usingComponents 引入


### @tarojs/mini-runner
如果遇到编译问题，建议先运行`taro doctor`，检查和保证依赖版本和本地、全局taro版本是否一致

```
taro doctor

检查依赖
  [!] 依赖 @tarojs/components 可更新到最新版本 3.0.11，当前安装版本为 3.0.5
  [✗] 依赖 @tarojs/mini-runner (3.0.11) 与当前使用的 Taro CLI (3.0.5) 版本不一致, 请更新为统一的版本
  [!] 依赖 @tarojs/runtime 可更新到最新版本 3.0.11，当前安装版本为 3.0.5
  [!] 依赖 @tarojs/taro 可更新到最新版本 3.0.11，当前安装版本为 3.0.5
  [✗] 依赖 @tarojs/webpack-runner (3.0.11) 与当前使用的 Taro CLI (3.0.5) 版本不一致, 请更新为统一的版本
  [!] 依赖 babel-preset-taro 可更新到最新版本 3.0.11，当前安装版本为 3.0.5
  [!] 依赖 eslint-config-taro 可更新到最新版本 3.0.11，当前安装版本为 3.0.5
```

1. `npm install -g @tarojs/cli@3.0.11`  升级全局taro版本；
2. 逐个更新本地项目中的taro相关依赖版本。

目前固定 taro 版本到最新的稳定版 3.0.9, 新的 3.0.11 版本的 initPxTransform 有问题, 应该是改过规则了
目前 taro 已经更新到 3.0.28, Taro.initPxTransform 的规则改了, 得把 375 设置成 2 才行


### H5 版本启动方式
H5 版本因为无法读取 ext.json, 可以通过环境变量的方式来指定本地测试的店铺, 只需要指定 api root 就行了
`API_URL=https://normal.heidianer.com/api/ npm run dev:h5`
