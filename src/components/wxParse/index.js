import WxParse from './wxParse'

import './wxParse.wxss'

Component({
  properties: {
    html: {
      type: String,
      value: '',
    }
  },
  ready () {
    WxParse.wxParse('wxParseData', 'html', this.properties.html, this)
  }
})
