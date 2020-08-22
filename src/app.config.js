export default {
  pages: [
    'pages/home/index',
    'pages/search/index',
    'pages/membership/index',
    'pages/cart/index',
    'pages/account/index',
    'pages/product/index',
    'pages/login/index',
    'pages/index/index'
  ],
  tabBar: {
    list: [
      {
        'pagePath': 'pages/home/index',
        'iconPath': 'assets/images/tabbar/home.png',
        'selectedIconPath': 'assets/images/tabbar/home-active.png',
        'text': '首页'
      },
      {
        'pagePath': 'pages/search/index',
        'iconPath': 'assets/images/tabbar/category.png',
        'selectedIconPath': 'assets/images/tabbar/category-active.png',
        'text': '商品'
      },
      {
        'pagePath': 'pages/membership/index',
        'iconPath': 'assets/images/tabbar/member.png',
        'selectedIconPath': 'assets/images/tabbar/member.png',
        'text': '会员'
      },
      {
        'pagePath': 'pages/cart/index',
        'iconPath': 'assets/images/tabbar/cart.png',
        'selectedIconPath': 'assets/images/tabbar/cart-active.png',
        'text': '购物车'
      },
      {
        'pagePath': 'pages/account/index',
        'iconPath': 'assets/images/tabbar/profile.png',
        'selectedIconPath': 'assets/images/tabbar/profile-active.png',
        'text': '我的'
      }
    ],
    backgroundColor: '#ffffff',
    color: '#000000',
    selectedColor: '#000000'
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
}
