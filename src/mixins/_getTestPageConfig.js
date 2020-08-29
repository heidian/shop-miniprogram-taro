export default function getTestPageConfig() {
  return {
    "settings_data": {
      "components": [{
        "name": "blocks/carousel",
        "css": {
          // component 下面的 css 只支持 padding 和 background !!
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
          "ratio": "0.75",
          "images": [{
            "src": "https://up.img.heidiancdn.com/o_1egsmgnhqv33120o15791qd21iov0Bitmap.jpg"
          }, {
            "src": "https://up.img.heidiancdn.com/o_1eepfu0ou1avbgh2u4v1g9r150l0G1093.jpeg"
          }]
        }
      }, {
        "name": "blocks/text",
        "css": {
          "padding": "10px 0"
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
          "paddingTop": "15px",
          "paddingRight": "15px",
          "paddingBottom": "15px",
          "paddingLeft": "15px",
          "backgroundColor": "#000000"
        },
        "settings_data": {
          "image": {
            "src": "https://up.img.heidiancdn.com/o_1eepfu0ou1avbgh2u4v1g9r150l0G1093.jpeg"
          }
        }
      }, {
        "name": "blocks/carousel",
        "css": {
          "padding": "30px",
          "backgroundColor": "#FF0000"
        },
        "settings_data": {
          //
        }
      }, {
        "name": "blocks/text",
        "css": {
          "padding": "20px 50px",
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
