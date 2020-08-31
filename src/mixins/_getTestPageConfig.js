/*
 * component 下面的 css 只支持 padding 和 background !!
 * 建站工具下面会支持写如板块根节点 css 属性, 建站工具会分开存储 padding 四个方向的值
 * 现在手写 padding 也一定要分成 paddingTop, paddingBottom, paddingRight, paddingLeft 写, 不然不方便转换成 rpx
 * backgroundImage 的写法还是 { src, metafield } 的格式, 而不是 css 的 url() 的写法
 */

export default function getTestPageConfig() {
  return {
    "settings_data": {
      "components": [{
        "name": "blocks/carousel",
        "css": {
          "paddingTop": "17%",
          "paddingBottom": "36%",
          "paddingRight": "10%",
          "paddingLeft": "10%",
          "backgroundColor": "#000000",
          "backgroundSize": "cover",
          "backgroundPosition": "center",
          "backgroundImage": {
            "src": "https://up.img.heidiancdn.com/o_1egskb7rhptkgul1mqv43i1r810Group2.jpg"
          }
        },
        "settings_data": {
          "imageRatio": "0.75",
          "images": [{
            "src": "https://up.img.heidiancdn.com/o_1egsmgnhqv33120o15791qd21iov0Bitmap.jpg"
          }, {
            "src": "https://up.img.heidiancdn.com/o_1egsmgnhqv33120o15791qd21iov0Bitmap.jpg"
          }]
        }
      }, {
        "name": "blocks/text",
        "css": {
          "paddingTop": "10px",
          "paddingBottom": "10px"
        },
        "settings_data": {
          "textAlign": "center",
          "text": {
            "value": "JOIN US NOW! · JOIN US NOW! · JOIN US NOW! · JOIN US NOW! · JOIN US NOW! · JOIN US NOW!",
            "style": {
              "fontSize": "0.8em",
              "fontWeight": "bold"
            }
          },
          "animation": "slideLeft"
        }
      }, {
        "name": "blocks/image",
        "css": {
          // "paddingTop": "15px",
          // "paddingRight": "15px",
          // "paddingBottom": "15px",
          // "paddingLeft": "15px",
          // "backgroundColor": "#000000"
        },
        "settings_data": {
          "image": {
            "src": "https://up.img.heidiancdn.com/o_1egsrse8caag1comocmr01hn80p9Copy.jpg"
          }
        }
      }, {
        "name": "blocks/image",
        "css": {
          "paddingTop": "30px",
          "paddingBottom": "20px",
          "paddingLeft": "80px",
          "paddingRight": "80px"
        },
        "settings_data": {
          "image": {
            "src": "https://up.img.heidiancdn.com/o_1egsruku5tu1t5kcgceli48v0roup32.png"
          }
        }
      }, {
        "name": "blocks/grids",
        "css": {
          "paddingTop": "6px",
          "paddingBottom": "20px",
          "paddingLeft": "6px",
          "paddingRight": "6px"
        },
        "settings_data": {
          "grids": [{
            "image": {
              "src": "https://up.img.heidiancdn.com/o_1egt6q067cjvif16aq1bmj14420roup12.jpg"
            },
            "text": {
              "value": ""
            }
          }, {
            "image": {
              "src": "https://up.img.heidiancdn.com/o_1egt6q06816fc1s151l0a3ot54i012Copy.jpg"
            },
            "text": {
              "value": ""
            }
          }],
          "gridGap": "6",
          "imageRatio": "1.333333",
          "textAlign": "left",
          "columns": 2
        }
      }, {
        "name": "blocks/image",
        "css": {
          "paddingTop": "30px",
          "paddingBottom": "10px",
          "paddingLeft": "20px",
          "paddingRight": "20px",
          "backgroundColor": "#E5E5E5"
        },
        "settings_data": {
          "image": {
            "src": "https://up.img.heidiancdn.com/o_1egsvog87d2vf6j1t5m4lf1sp00roup42.png"
          }
        }
      }, {
        "name": "blocks/featured_products",
        "css": {
          "paddingTop": "0",
          "paddingBottom": "30px",
          "paddingLeft": "15px",
          "paddingRight": "15px",
          "backgroundColor": "#E5E5E5"
        },
        "settings_data": {
          "gridGap": "8",
          "imageRatio": "1",
          "columns": 3,
          "productsQuery": {
            "page_size": 6
          }
        }
      }, {
        "name": "blocks/image",
        "css": {},
        "settings_data": {
          "image": {
            "src": "https://up.img.heidiancdn.com/o_1eh1m60avec4ot71gnm1m2q1gcj0roup35.jpg"
          }
        }
      }, {
        "name": "blocks/carousel",
        "css": {
          "paddingTop": "46%",
          "paddingBottom": "36%",
          "paddingRight": "15%",
          "paddingLeft": "15%",
          "backgroundColor": "#000000",
          "backgroundSize": "cover",
          "backgroundPosition": "center",
          "backgroundImage": {
            "src": "https://up.img.heidiancdn.com/o_1eh1l2h65v7g19io9du4bp1nau0roup42.jpg"
          }
        },
        "settings_data": {
          "imageRatio": "0.6279",
          "images": [{
            "src": "https://up.img.heidiancdn.com/o_1eh1lffgq11nj1hqlcpqp64s5p0alHome.jpg"
          }, {
            "src": "https://up.img.heidiancdn.com/o_1eh1lffgq11nj1hqlcpqp64s5p0alHome.jpg"
          }]
        }
      }, {
        "name": "blocks/text",
        "css": {
          "paddingTop": "20px",
          "paddingBottom": "20px",
          "paddingLeft": "50px",
          "paddingRight": "50px",
          "backgroundColor": "#FFFFFF"
        },
        "settings_data": {
          "text": {
            "value": "这是一个文字板块"
          }
        }
      }]
    },
    "template": "__COMPONENTS__",
    "layout": "layouts/default"
  }
}
