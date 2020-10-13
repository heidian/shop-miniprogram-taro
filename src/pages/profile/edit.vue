<template>
  <view :class="$style['profile']">
    <form class="form">
      <view :class="['form-item', $style['avatar']]">
        <image :src="userInfo.avatar" mode="aspectFill" :class="$style['avatarImage']" @tap="onSelectAvatar"></image>
      </view>
      <view class="form-item">
        <view class="label">姓名</view>
        <input class="input" v-model="userInfo.full_name" type="text"/>
      </view>
      <view class="form-item">
        <view class="label">性别</view>
        <picker class="picker" mode="selector" @change="onChangeGender" :value="genderIndex" :range="genderOptions" range-key="title">
          <view class="picker">
            {{ genderOptions[genderIndex].title }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <view class="label">生日</view>
        <picker class="picker" mode="date" @change="onChangeBirthday" :value="userInfo.birthday">
          <view class="picker">
            {{ userInfo.birthday || '请选择你的生日'}}
          </view>
        </picker>
      </view>
    </form>
    <view :class="$style['buttonsWrapper']">
      <button open-type="getUserInfo" @getUserInfo="getUserInfo" :class="['button', $style['wechatBtn']]" type="primary">
        <image :class="$style['buttonIcon']" src="https://up.img.heidiancdn.com/o_1cgtnj1nadol7n31b8n1lfidgb0wechat.png"></image>使用微信信息
      </button>
      <button class="button button--dark" @tap="submitForm">保存</button>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { mapState } from 'vuex'
import { handleErr } from '@/utils/errHelper'
import RequiresLogin from '@/mixins/RequiresLogin'

export default {
  name: 'ProfileEdit',
  mixins: [ RequiresLogin ],
  data() {
    return {
      navigators: [
        { label: '微信号', value: '', hasCaret: true, url: '' },
        { label: '个人信息', value: '', hasCaret: true, url: '' },
        { label: '账户安全', value: '', hasCaret: true, url: '' },
        { label: '联系客服', value: '', hasCaret: true, url: '', openType: 'contact' },
        { label: '关于', value: '', hasCaret: true, url: '' },
      ],
      genderOptions: [
        { title: '未知', value: 'unknown' },
        { title: '男', value: 'male' },
        { title: '女', value: 'female' }
      ],
      userInfo: {},
      genderIndex: 0,
      uploading: false,
      pending: false,
    }
  },
  created () {
    Taro.setBackgroundColor({
      backgroundColorTop: '#ffffff',
      backgroundColor: '#f6f6f6',
      backgroundColorBottom: '#f6f6f6',
    })
  },
  mounted() {
    const { full_name, gender, birthday, avatar } = _.cloneDeep(this.customer.data) || {}
    this.userInfo = {
      full_name, gender, birthday, avatar
    }
    if (gender === 'male') {
      this.genderIndex = 1
    } else if (gender === 'female') {
      this.genderIndex = 2
    } else {
      this.genderIndex = 0
    }
  },
  computed: {
    ...mapState(['customer'])
  },
  methods: {
    onChangeGender (e) {
      this.genderIndex = +e.detail.value
    },
    onChangeBirthday (e) {
      this.userInfo.birthday = e.detail.value
    },
    submitForm() {
      if (this.pending) return
      if (this.genderIndex === 1) {
        this.userInfo.gender = 'male'
      } else if (this.genderIndex === 2) {
        this.userInfo.gender = 'female'
      } else {
        this.userInfo.gender = 'unknown'
      }
      this.$store.dispatch('customer/updateCustomer', this.userInfo).then(data => {
        this.pending = false
        Taro.showToast({ title: '更新成功' })
        setTimeout(() => Taro.navigateBack(), 1000)
      }).catch(err => {
        this.pending = false
        handleErr(err)
      })
    },
    getUserInfo (e) {
      const { userInfo } = e.detail
      const { nickName, gender, avatarUrl } = userInfo
      this.userInfo = {
        ...this.userInfo,
        full_name: nickName,
        avatar: avatarUrl
      }
      this.genderIndex = gender
    },
    onSelectAvatar () {
      if (!!this.uploading) return
      this.uploading = true
      Taro.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
      }).then(res => {
        const tempFilePath = res.tempFilePaths[0]
        this.$store.dispatch('qiniu/uploadImage', tempFilePath).then(image => {
          this.userInfo.avatar = image.src
          this.uploading = false
        }).catch(err => {
          handleErr(err)
          this.uploading = false
        })
      }).catch(err => {
        this.uploading = false
      })
    }
  }
}
</script>

<style lang="scss" module>
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.avatar:global(.form-item) {
  display: flex;
  justify-content: center;
  height: auto;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 30px;
  padding-bottom: 30px;
}
.avatarImage {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f0f0f0;
}
.buttonsWrapper {
  position: fixed;
  z-index: $z-index-footer;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 20px;
  :global(.button) {
    width: 100%;
    display: block;
  }
}
.wechatBtn {
  margin-bottom: 15px;
  .buttonIcon {
    width: 16px;
    height: 16px;
    margin-right: 3px;
    vertical-align: middle;
  }
}
</style>
