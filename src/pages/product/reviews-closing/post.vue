<template>
  <view :class="$style['postReview']">
    <view :class="$style['title']">创造您的评价</view>
    <view :class="[$style['hint'], $style['textCenter']]">*为必须填写</view>
    <form :class="$style['form']" @submit="onSubmit" @reset="onReset">
      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel'], $style['required']]">姓名</view>
          <input :class="$style['formItemValue']" v-model="form.fullName.value" placeholder="您的姓名"></input>
        </view>
      </view>
      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">年龄</view>
          <input :class="$style['formItemValue']" v-model="form.age.value" placeholder="00"></input>
        </view>
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">身高（{{form.height.unit}}）</view>
          <input :class="$style['formItemValue']" v-model="form.height.value" placeholder="000"></input>
        </view>
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">体重（{{form.weight.unit}}）</view>
          <input :class="$style['formItemValue']" v-model="form.weight.value" placeholder="000"></input>
        </view>
      </view>
      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">上胸围（{{form.upperBust.unit}}）</view>
          <input :class="$style['formItemValue']" v-model="form.upperBust.value" placeholder="000"></input>
        </view>
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">下胸围（{{form.lowerbust.unit}}）</view>
          <input :class="$style['formItemValue']" v-model="form.lowerbust.value" placeholder="000"></input>
        </view>
      </view>
      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">腰围（{{form.waistline.unit}}）</view>
          <input :class="$style['formItemValue']" v-model="form.waistline.value" placeholder="000"></input>
        </view>
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">肚脐围（{{form.bellyButton.unit}}）</view>
          <input :class="$style['formItemValue']" v-model="form.bellyButton.value" placeholder="000"></input>
        </view>
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel']]">臀围（{{form.hips.unit}}）</view>
          <input :class="$style['formItemValue']" v-model="form.hips.value" placeholder="000"></input>
        </view>
      </view>

      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel'], $style['required']]">您的评分</view>
          <view :class="$style['formItemValueRating']">
            <view
              v-for="i in [1,2,3,4,5]" :key="i"
              :class="[$style['ratingStar'], i <= form.score.value && $style['ratingStarActive']]"
              @tap="() => form.score.value = i"></view>
          </view>
        </view>
      </view>
      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel'], $style['required']]">购买尺寸</view>
          <view :class="[$style['formItemValue'], $style['formItemValueReadOnly']]">{{ variantSize && variantSize.value }}</view>
        </view>
      </view>
      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel'], $style['required']]">合身度</view>
          <view :class="[$style['formItemHint']]">（移动圆点至适当选项）</view>
          <view :class="[$style['formItemValueSlider']]">
            <slider
              :class="$style['slider']"
              :value="form.fitValue.value"
              @change="(e) => form.fitValue.value = +e.detail.value"
              :min="0" :max="2" :step="1"
              backgroundColor="#272727"
              activeColor="#847CB4"
              :blockSize="14"
              blockColor="#847CB4"
              />
            <view :class="$style['sliderHints']">
              <text :class="$style['sliderHint']">宽松</text>
              <text :class="$style['sliderHint']">合身</text>
              <text :class="$style['sliderHint']">紧致</text>
            </view>
          </view>
        </view>
      </view>

      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel'], $style['required']]">评价标题</view>
          <input :class="$style['formItemValue']" v-model="form.title.value" placeholder="请输入评价标题"></input>
        </view>
      </view>
      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <view :class="[$style['formItemLabel'], $style['required']]">评价内容</view>
          <textarea :class="$style['formItemValueTextarea']" :autoHeight="true" v-model="form.content.value" placeholder="请输入评价内容"></textarea>
        </view>
      </view>

      <view :class="$style['formRow']">
        <view :class="$style['formItem']">
          <button
            formType="submit"
            :disabled="!!pending || !!formErrorMsg"
            :class="['button button--dark', $style['formBtn']]">{{ !!pending ? '正在提交' : '提交' }}</button>
        </view>
      </view>
    </form>
  </view>
</template>

<script>
import Taro, { getCurrentInstance, getCurrentPages } from '@tarojs/taro'
import { mapState } from 'vuex'
import _ from 'lodash'
import { API } from '@/utils/api'
import { handleErr } from '@/utils/errHelper'

export default {
  name: 'Post',
  data () {
    const { product, variant } = getCurrentInstance().router.params
    return {
      productId: +product || null,
      variantId: +variant || null,
      variant: null,
      productTitle: '',
      pending: false,
      /** form variables */
      form: {
        fullName: {
          value: '',
          label: '姓名',
          unit: ''
        },
        age: {
          value: '',
          label: '年龄',
          unit: ''
        },
        height: {
          value: '',
          label: '身高',
          unit: 'CM'
        },
        weight: {
          value: '',
          label: '体重',
          unit: 'KG'
        },
        upperBust: {
          value: '',  // 上胸围
          label: '上胸围',
          unit: 'CM'
        },
        lowerbust: {
          value: '',  // 下胸围
          label: '下胸围',
          unit: 'CM'
        },
        waistline: {
          value: '',  // 腰围
          label: '腰围',
          unit: 'CM'
        },
        bellyButton: {
          value: '',  // 肚脐围
          label: '肚脐围',
          unit: 'CM'
        },
        hips: {
          value: '',  // 臀围
          label: '臀围',
          unit: 'CM'
        },
        score: {
          value: 0,
          label: '您的评分',
          unit: ''
        },
        fitValue: {
          value: 1,  // 0: 宽松，1: 合身，2: 紧致,
          label: '合身度',
          unit: ''
        },
        title: {
          value: '',  // 评价标题
          label: '评价标题',
          unit: ''
        },
        content: {
          value: '',  // 评价内容
          label: '评价内容',
          unit: ''
        },
      },
      /** form item required */
      required: {
        fullName: true,
        age: false,
        height: false,
        weight: false,
        upperBust: false,
        lowerbust: false,
        waistline: false,
        bellyButton: false,
        hips: false,
        score: true,
        fitValue: true,
        title: true,
        content: true,
      }
    }
  },
  computed: {
    variantSize() {
      const options = _.get(this.variant, 'options', [])
      const optionSize = _.find(options || [], { title: '尺寸' })
      return optionSize || {}
    },
    formErrorMsg() {
      const { fullName, score, title, content } = this.form
      if (!fullName.value) return '姓名不能为空'
      if (!+score.value || +score.value < 1 || +score.value > 5) return '评分区间为1～5分'
      if (!title.value) return '请输入评价标题'
      if (!content.value) return '请输入评价内容'
      return ''
    }
  },
  mounted () {
    this.fetchProductVariantData()
  },
  methods: {
    fetchProductVariantData () {
      this.pending = true
      API.get(`/shopfront/product/${this.productId}/`, {
        params: {
          fields: 'title,variants',
          page_size: 1
        }
      }).then(res => {
        const { title, variants } =  res.data || {}
        this.productTitle = title
        Taro.setNavigationBarTitle({ title })
        this.variant = _.find(variants, { id: this.variantId })
        this.pending = false
      }).catch(err => {
        this.pending = false
        handleErr(err)
      })
    },
    onSubmit() {
      let content = ''
      _.forEach(this.form, (item, key) => {
        if (item.value) {
          if (item.label === '合身度') {
            // 如果是合身度，需要将数字再转化成字符串
            content += item.label + '：' + ['宽松', '合身', '紧致'][item.value] + '\n'
          } else {
            content += item.label + '：' + item.value + '\n'
          }
        }
      })
      content += `购买尺寸：${this.variantSize ? this.variantSize.value : '-'}`

      const payload = {
        'owner_resource': 'product',
        'owner_id': this.productId,
        'content': content
      }
      this.pending = true
      API.post('/customers/review/', payload).then(res => {
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 1500, //延迟时间,
          mask: true,
        })
        this.pending = false
        _.delay(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            Taro.navigateBack()
          } else {
            Taro.switchTab({ url: '/pages/home' })
          }
        }, 1500)
      }).catch(err => {
        handleErr(err)
        this.pending = false
      })
    },
    onReset() {

    }
  }

}
</script>
<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: #f6f6f6;
}
.postReview {
  min-height: 100vh;
  position: relative;
  padding: 30px 15px 80px;
}
.title {
  font-size: 18px;
  font-weight: bold;
  text-align: left;
}
.hint {
  font-size: 12px;
}
.textCenter {
  text-align: center;
}

/** form styles */
.form {
  width: 100%;
  display: block;
}
.formRow {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.formItem {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 25px;
  & + & {
    margin-left: 10px;
  }
}
.formItemLabel {
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  margin-bottom: 5px;
  &.required::after {
    content: "*";
    margin-left: 3px;
    font-size: 12px;
    line-height: 20px;
  }
}
.formItemHint {
  font-size: 13px;
  margin-bottom: 5px;
}
.formItemValue {
  height: 40px;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid rgba(#272727, 0.7);
  line-height: 20px;
  font-size: 14px;
  padding: 10px 15px;
  &.formItemValueReadOnly {
    background-color: #fefefe;
  }
}
.formItemValueTextarea {
  height: auto;
  min-height: 200px;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid rgba(#272727, 0.7);
  line-height: 20px;
  font-size: 14px;
  padding: 10px 15px;
}
.formItemValue:focus {
  border-color: orange;
}
.formItemValueRating {
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.ratingStar {
  width: 30px;
  height: 30px;
  background: url('https://up.img.heidiancdn.com/o_1f0ioeg2h1i5a1p241kqslkd1bi20star.png') no-repeat center;
  background-size: 20px 20px;
  & + & {
    margin-left: 5px;
  }
  &.ratingStarActive {
    background-image: url('https://up.img.heidiancdn.com/o_1f0ioeg2fdmh1ba81nvhoon18ip0star1.png');
  }
}

.formItemValueSlider {
  height: auto;
  width: 100%;
  position: relative;
}
.slider {
  border-left: 2px solid #272727;
  border-right: 2px solid #272727;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 18px;
    margin-top: -9px;
    border-left: 2px solid #272727;
  }
}

.sliderHints {
  padding: 0 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sliderHint {
  font-size: 13px;
}
.formBtn {
  width: 100%;
}
</style>
