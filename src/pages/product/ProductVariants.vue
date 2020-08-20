<template>
  <view>
    <!-- Taro 是先用 vue 完全编译好输出节点再一次性填充到一个 wxml 模板里, 这里的 key 写法和 vue 一样 -->
    <view
      v-for="variant in variants" :key="variant.id"
    >({{ variant.id }})</view>
    <!-- 闭合标签尽量和文本内容紧贴, 避免出现前后空格, 内部元素是标签就随意 -->
  </view>
</template>

<script>
/* 页面私有组件放在页面同一个目录下,
因为 taro 无法实现 vue 的 scoped css, 样式写在页面和组件里都可以, 注意 class 冲突就行 */
export default {
  props: {
    variants: {
      type: Array,
      default: () => ([])
    },
    /* prop 名字用驼峰, 不要用下划线 */
    propName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      //
    }
  },
  mounted() {
    console.log('variants', this.variants)
  }
}
</script>
