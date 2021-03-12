export default {
  pages: [
    'pages/home',
    'pages/categories/index',
    'pages/cart/index',
    'pages/account/index',
    'pages/account/settings',
    'pages/account/coupon-codes',
    'pages/account/favorites',
    'pages/profile/edit',
    'pages/search/index',
    'pages/product/index',
    'pages/product/reviews/index',
    'pages/product/reviews/post',
    'pages/product/reviews-closing/post',
    'pages/product/reviews/reply',
    'pages/product/accessories/index',
    'pages/login/index',
    'pages/checkout/index',
    'pages/addresses/index',
    'pages/addresses/edit',
    'pages/orders/index',
    'pages/orders/detail',
    'pages/static/index',
    'pages/blog/index',
    'pages/blog/article',
    'pages/misc/share',
    'pages/misc/share-landing',
    'pages/misc/webview',
    'pages/index/index'
  ],
  tabBar: {
    list: [
      {
        'pagePath': 'pages/home',
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
