export default {
  pages: [
    'pages/home/index',
    'pages/categories/index',
    'pages/partner/index',
    'pages/cart/index',
    'pages/account/index',
    'pages/account/bind-alipay',
    'pages/account/settings',
    'pages/account/profile',
    'pages/search/index',
    'pages/product/index',
    'pages/product/reviews/index',
    'pages/product/reviews/post',
    'pages/product/reviews/reply',
    'pages/login/index',
    'pages/checkout/index',
    'pages/addresses/index',
    'pages/addresses/edit',
    'pages/orders/index',
    'pages/orders/detail',
    'pages/static/index',
    'pages/misc/share',
    'pages/misc/landing',
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
        'pagePath': 'pages/categories/index',
        'iconPath': 'assets/images/tabbar/category.png',
        'selectedIconPath': 'assets/images/tabbar/category-active.png',
        'text': '分类'
      },
      {
        'pagePath': 'pages/partner/index',
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
