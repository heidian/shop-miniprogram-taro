<template>
  <view :class="$style['section']" :style="{ ...css, display: products && products.length ? 'block' : 'none' }">
    <view :class="$style['sectionHead']">
      <view :class="$style['sectionTitle']">{{ accessoriesCaption.sectionTitle || '搭配购买' }}</view>
      <!-- <navigator :class="$style['btnMore']" :url="`/pages/product/accessories/index?product=${product.id}`">查看全部</navigator> -->
    </view>
    <navigator
      :url="`/pages/product/accessories/index?product=${product.id}`"
      :class="$style['sectionContainer']"
    >
      <view :class="$style['accessoriesImages']">
        <view v-for="product in accessoriesSlicedProduct" :key="product.id" :class="$style['item']">
          <view :class="$style['itemImage']" :style="{'background-image': backgroundImageUrl(product.image, 100)}"></view>
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
      default: () => ({})
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
    accessoriesCaption() {
      const { accessories_section_title, accessories_title } = this.settings_data || {}
      return {
        sectionTitle: _.get(accessories_section_title, 'value') || accessories_section_title,
        title: _.get(accessories_title, 'value') || accessories_title
      }
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
.sectionHead {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 15px 10px;
}
.sectionTitle {
  width: 100%;
  font-weight: bold;
  color: $color-text;
  font-size: 16px;
  text-align: center;
}
.btnMore {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: $color-text;
}
.sectionContainer {
  // background-color: #fafafa;
  padding: 10px;
  margin: 0 10px 10px;
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
  font-size: 15px;
  margin-top: 10px;
}
.accessoriesTitle {
  font-size: 14px;
  line-height: 1.7;
}
.accessoriesPrice {
  font-size: 13px;
  font-weight: normal;
  line-height: 1.7;
  color: $color-orange;
}
.itemRow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  & + & {
    margin-top: 10px;
  }
}
</style>

