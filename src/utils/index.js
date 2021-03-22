/* 一些常用的, 又不需要分类的方法 */
import _ from 'lodash'
import tinycolor from 'tinycolor2'
import Taro from '@tarojs/taro'
import store from '../store/index'


export const syncTabBarStyleWithTheme = async () => {
  const tabBar = _.get(store.state.theme, 'themeSettingsData.tabBar', {})
  try {
    const style = { borderStyle: 'white' }
    _.forEach(['backgroundColor', 'color', 'selectedColor'], (field) => {
      if (tabBar[field]) {
        style[field] = tinycolor(tabBar[field]).toHexString()
      }
    })
    await Taro.setTabBarStyle(style)
  } catch(err) {
    console.log(err)
  }
  try {
    const list = tabBar.list || []
    for (let index = 0; index < list.length; index++) {
      const item = list[index]
      const itemData = { index }
      _.forEach(['text', 'iconPath', 'selectedIconPath'], (field) => {
        if (item[field]) {
          itemData[field] = item[field]
        }
      })
      await Taro.setTabBarItem(itemData)
    }
  } catch(err) {
    console.log(err)
  }
}
