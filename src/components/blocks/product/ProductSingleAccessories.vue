<template>
  <view :class="$style['section']" :style="css">
    <view :class="$style['sectionTitle']">{{ accessoriesCaption.sectionTitle || '搭配购买' }}</view>
    <navigator
      :url="`/pages/product/accessories/index?product=${product.id}`"
      :class="$style['sectionContainer']"
    >
      <view :class="$style['accessoriesImages']">
        <view :class="$style['itemRow']">
          <view :class="$style['accessoriesProductItem']" :style="{'background-image': backgroundImageUrl(firstAccessoriesImage, 100)}"></view>
        </view>
        <view :class="$style['itemRow']">
          <view
            v-for="product in accessoriesSlicedProduct"
            :key="product.id"
            :class="$style['accessoriesProductItem']"
            :style="{'background-image': backgroundImageUrl(product.image, 100)}"
          ></view>
        </view>
      </view>
      <view :class="$style['accessoriesCaption']">
        <view v-if="accessoriesCaption.title" :class="$style['accessoriesTitle']">{{ accessoriesCaption.title }}</view>
        <view :class="$style['accessoriesPrice']" >价格 {{ accessoriesMinPrice || '-' }} 元起</view>
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
      return (this.products || []).slice(1, 3)
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
        fields: 'id,image,price',
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
  font-weight: bold;
  font-size: 15px;
  padding: 15px 15px 10px;
}
.sectionContainer {
  background-color: #fafafa;
  padding: 10px;
  margin: 0 10px 10px;
  display: flex;
}
.accessoriesImages {
  width: 130px;
  display: flex;
  flex-direction: column;
}
.accessoriesCaption {
  margin-left: 10px;
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.accessoriesProductItem {
  width: 60px;
  height: 60px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  & + & {
    margin-left: 10px;
  }
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

