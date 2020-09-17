<template>
  <view class="page--profile">
    <form class="form">
      <view class="form-item form-item--avatar">
        <image :src="userInfo.avatar" mode="aspectFill" class="avatarImage" @tap="onSelectAvatar"></image>
      </view>
      <view class="form-item">
        <view class="label">姓名</view>
        <input class="input" v-model="userInfo.full_name" type="text"/>
      </view>
      <!-- <view class="form-item">
        <view class="label">联系电话</view>
        <input class="input" v-model="userInfo.mobile" type="digit"/>
      </view> -->

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
    <view class="buttons-wrapper">
      <button type="primary" open-type="getUserInfo" @getUserInfo="getUserInfo" :withCredentials="false">
        <image class="buttonIcon" src="https://up.img.heidiancdn.com/o_1cgtnj1nadol7n31b8n1lfidgb0wechat.png"></image>使用微信信息
      </button>
      <button class="button--dark" @tap="submitForm">保存</button>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import _ from 'lodash'
import { mapState } from 'vuex'
import { uploadImage } from '@/utils/uploader'
import { handleErr } from '@/utils/errHelper'
import RequiresLogin from '@/mixins/RequiresLogin'

export default {
  name: 'Profile',
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
      backgroundColor: '#f6f6f6',
      backgroundColorTop: '#ffffff',
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
    ...mapState(['customer', 'clients']),
    uptoken () {
      return _.get(this.clients, 'uptoken', '')
    }
  },
  methods: {
    onChangeGender (e) {
      this.genderIndex = +e.detail.value
    },
    onChangeBirthday (e) {
      this.userInfo.birthday = e.detail.value
    },
    async submitForm() {
      if (this.pending) return
      if (this.genderIndex === 1) {
        this.userInfo.gender = 'male'
      } else if (this.genderIndex === 2) {
        this.userInfo.gender = 'female'
      } else {
        this.userInfo.gender = 'unknown'
      }
      this.$store.dispatch('customer/updateCustomerProfile', this.userInfo).then(data => {
        this.pending = false
        Taro.showToast({ title: '更新成功' })
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
        uploadImage(tempFilePath, this.uptoken).then(uploadRes => {
          if (!!uploadRes.link) this.userInfo.avatar = uploadRes.link
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

<style lang="scss">
@import '@/styles/variables';
page {
  background-color: $color-bg-gray;
}
.page--profile {
  background-color: $color-bg-gray;
  .form {
    display: block;
    overflow: hidden;
    background-color: #fff;
    padding-bottom: 20px;
  }
  .form-item {
    position: relative;
    &::after {
      position: absolute;
      content: "";
      display: block;
      bottom: 0;
      right: 0;
      left: 100px;
      border-bottom: 1px solid $color-divider;
    }
    &:last-child::after {
      left: 0;
    }
    padding: 3px 0 3px 100px;
    height: 50px;  // 内容高度是 44, 整体高度是 50
    .input {
      display: block;
      margin: 10px 0;
      height: 24px;
      line-height: 24px;
    }
    .picker {
      display: block;
      height: 44px;
      line-height: 44px;
      margin: 0;
    }
  }
  .label {
    position: absolute;
    top: 0;
    height: 50px;
    line-height: 50px;
    width: 80px;
    left: 15px;
    color: $color-text-light;
  }
  .form-item--avatar {
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
  .buttons-wrapper {
    position: fixed;
    z-index: $z-index-footer;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 20px;
    button {
      display: block;
    }
    button .buttonIcon {
      width: 16px;
      height: 16px;
      margin-right: 3px;
      vertical-align: middle;
    }
    button + button {
      margin-top: 15px;
    }
  }
}
</style>


