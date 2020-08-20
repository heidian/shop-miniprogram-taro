<template>
  <view>
    <view>{{ product.title }}</view>

    <view>{{ product.image|imageUrl }}</view>  <!-- filter 写法 -->
    <image mode="aspectFit" :src="optimizeImage(product.image)"></image> <!-- 方法写法 -->

    <!-- 用 backgroundImageUrl 方法代替字符串拼接, 可以处理 ur 中的引号等问题 -->
    <view
      class="product-image-bg"
      :style="{'backgroundImage': backgroundImageUrl(product.image)}"
    ></view>

    <view>{{ product.created_at|datetime }}</view>
    <view>{{ product.created_at|date }}</view>

    <!-- currency filter 可以处理负数金额等, 订单和结算里面游泳, 商品的划线价格等显示不需要用 currency 这个 filter -->
    <view>{{ product.price|currency }}</view>

    <!-- template 里面标签不要用大写, 全部用小写+减号 -->
    <product-variants :variants="product.variants"></product-variants>
  </view>
</template>

<script>
import { getCurrentInstance } from '@tarojs/taro'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'
import ProductVariants from './ProductVariants'

export default {
  name: 'Product',
  components: {
    /* 组件名称用首字母大写, template 里面标签不能用大写, 全部用小写+减号 */
    ProductVariants
  },
  data() {
    /* getCurrentInstance 只在生命周期方法里用, 一般在 created() 或者 data() 方法里面用 */
    const { id, name } = getCurrentInstance().router.params
    /* 服务器端取下来的数据放入 this.[propertyName] 以后, 其他处理过的数据不要放进 this.[propertyName], 直接放在 this 下面,
    data() 方法返回的属性和本地变量名称用驼峰, 其他 object 的 key 不做限制 */
    return {
      pending: true,
      productId: id,
      productName: name,
      product: {
        variants: []
      }
    }
  },
  created() {},
  async mounted() {
    await this.fetchProduct()
  },
  methods: {
    optimizeImage,
    backgroundImageUrl,
    /* 方法名称用驼峰 */
    async fetchProduct() {
      // TODO 要处理 404
      const fields = ['id', 'title', 'image', 'variants', 'price', 'created_at']
      let product = null
      if (this.productId) {
        const res = await API.get(`/shopfront/product/${this.productId}/`, {
          params: { fields }
        })
        product = res.data
      } else if (this.productName) {
        /* 不要拼接 url, 用 params */
        const res = await API.get('/shopfront/product/', {
          params: { fields, name: this.productName }
        })
        /* res.data.results 一定是数组不会有问题, 只需要看长度就行 */
        product = res.data.results[0]
      }
      if (product) {
        this.product = product
      } else {
        // 抛出异常
      }
    }
  }
}
</script>

<style lang="scss">
/* Taro vue 版本不支持 scoped, 只能用 cssModule, 这里不要写 scoped, 平时注意 class 冲突 */
.product-image-bg {
  /* 没特殊原因全部用 px, Taro 会转成 rpx, 按照 750px 的设计稿实际像素尺寸来写
  除非是要结合 js 计算尺寸, 比如使用屏幕宽度等, 这时候需要禁用 px 到 rpx 的转换 (可以参考 search.vue), 这时候 px 按照逻辑尺寸来写 */
  width: 200px;
  height: 200px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
