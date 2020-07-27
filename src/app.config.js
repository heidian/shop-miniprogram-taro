export default {
  pages: [
    'pages/index/index',
    'pages/inventory/index',
    'pages/leases/index',
    'pages/customers/index',
    'pages/account/index'
  ],
  tabBar: {
    list: [
      {
        'pagePath': 'pages/index/index',
        'iconPath': 'assets/images/tabbar/home@2x.png',
        'selectedIconPath': 'assets/images/tabbar/home-active@2x.png',
        'text': '首页'
      },
      {
        'pagePath': 'pages/inventory/index',
        'iconPath': 'assets/images/tabbar/inventory@2x.png',
        'selectedIconPath': 'assets/images/tabbar/inventory-active@2x.png',
        'text': '库存'
      },
      {
        'pagePath': 'pages/leases/index',
        'iconPath': 'assets/images/tabbar/contract@2x.png',
        'selectedIconPath': 'assets/images/tabbar/contract-active@2x.png',
        'text': '合同'
      },
      {
        'pagePath': 'pages/customers/index',
        'iconPath': 'assets/images/tabbar/customer@2x.png',
        'selectedIconPath': 'assets/images/tabbar/customer-active@2x.png',
        'text': '客户'
      },
      {
        'pagePath': 'pages/account/index',
        'iconPath': 'assets/images/tabbar/profile@2x.png',
        'selectedIconPath': 'assets/images/tabbar/profile-active@2x.png',
        'text': '我的'
      }
    ],
    backgroundColor: '#222c3c',
    color: '#b7c0cd',
    selectedColor: '#009cfe'
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
}
