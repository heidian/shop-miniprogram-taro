import Taro from '@tarojs/taro'
import { mapState } from 'vuex'

export default {
  created() {
    if (!this.customer.isAuthenticated) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  },
  computed: {
    ...mapState(['customer'])
  }
}
