<template>
  <view :class="$style['section']" :style="{ ...css, display: products && products.length ? 'block' : 'none' }">
    <view
      v-if="settingsData.sectionTitle && settingsData.sectionTitle.value"
      :class="$style['sectionTitle']" :style="settingsData.sectionTitle.style || {}"
    >{{ settingsData.sectionTitle.value }}</view>
    <navigator
      :url="`/pages/product/accessories/index?product=${product.id}`"
      :class="$style['sectionContainer']" hover-class="none"
    >
      <view :class="$style['accessoriesImages']">
        <view v-for="product in accessoriesSlicedProduct" :key="product.id" :class="$style['item']">
          <view :class="$style['itemImage']" :style="{'background-image': backgroundImageUrl(product.image, 200)}"></view>
          <view :class="$style['itemTitle']">{{ product.title }}</view>
        </view>
      </view>
    </navigator>
  </view>
</template>

<script>
import _ from 'lodash'
import { API } from '@/utils/api'
import { optimizeImage, backgroundImageUrl } from '@/utils/image'

export default {
  name: 'ProductSingleAccessories',
  props: {
    css: {
      type: Object,
      default: () => ({})
    },
    settingsData: {
      type: Object,
      default: () => ({
        sectionTitle: { value: '' },  // 板块标题
      })
    },
    product: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      pending: false,
      products: []
    }
  },
  created() {
    this.fetchAccessories()
  },
  computed: {
    firstAccessoriesImage() {
      return _.get(this.products, '[0].image', '')
    },
    accessoriesSlicedProduct() {
      return (this.products || []).slice(0, 2)
    },
    accessoriesMinPrice() {
      const price_list = _.map(this.products || [], (r_p) => {
        return +(r_p.price || 0)
      })
      return _.min(price_list)
    },
  },
  methods: {
    backgroundImageUrl,
    fetchAccessories() {
      const params = {
        fields: 'id,image,title,price',
        page_size: 3
      }
      const url = `/shopfront/product/${this.product.id}/accessories/`
      this.pending = true
      API.get(url, { params }).then((res) => {
        const results = _.isArray(res.data) ? res.data : _.get(res.data, 'results', [])
        this.products = _.map(results, (item) => {
          return {
            ...item,
            price: +item.price
          }
        })
        this.pending = false
      }).catch(err => {
        console.log(err)
        this.pending = false
        throw err
      })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/mixins';
@import '@/styles/variables';
.section {
  overflow: hidden;
  background-color: #ffffff;
}
.sectionTitle {
  text-align: center;
  padding: 15px 15px 0;
}
.sectionContainer {
  // background-color: #fafafa;
  padding: 10px;
  display: flex;
}
.accessoriesImages {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.item {
  width: calc(50% - 5px);
  position: relative;
  & + & {
    margin-left: 10px;
  }
}
.itemImage {
  width: 100%;
  padding-top: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    right: -50px;
    bottom: -50px;
    background-color: rgba(#ffffff, 0.7);
  }
  &::after {
    content: '+';
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 24px;
    line-height: 44px;
    width: 40px;
    text-align: center;
  }
}
.itemTitle {
  text-align: center;
  margin-top: 10px;
}
</style>
