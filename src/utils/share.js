import Taro from '@tarojs/taro'
import _ from 'lodash'

const { pixelRatio: dpr } = Taro.getSystemInfoSync()

function _drawText (ctx, { offsetLeft, offsetTop, maxWidth, texts, miniqrUrl }) {
  _.forEach(texts, item => {
    ctx.font = `${item.fontSize || 14}px sans-serif`
    ctx.fillStyle = item.color
    ctx.fillText(item.value, offsetLeft, offsetTop, maxWidth)
    if (item.fontWeight === 'bold') {
      ctx.fillText(item.value, offsetLeft + 0.4, offsetTop, maxWidth)
    }
    offsetLeft += item.value.length * item.fontSize
    ctx.save()
  })
}

function _getCanvasImageUrl (original_src, width, height) {
  if (!original_src) return ''
  var url = original_src.split('?')[0]
  url += `?imageMogr2/thumbnail/!${width}x${height || width}r/crop/${width}x${height || width}`
  return url
}

function _drawBadge(ctx, { offsetLeft, offsetTop, text, fillColor, color }) {
  const badgeHeight = 28, badgeWidth = 90
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(offsetLeft, offsetTop) // badge 左上角
  ctx.lineTo(offsetLeft + badgeWidth, offsetTop) // 右上角
  ctx.arcTo(offsetLeft + badgeWidth - badgeHeight / 2, offsetTop + badgeHeight / 2, offsetLeft + badgeWidth, offsetTop + badgeHeight, badgeHeight / 1.7)
  ctx.lineTo(offsetLeft + badgeWidth, offsetTop + badgeHeight) // 右下角
  ctx.lineTo(offsetLeft, offsetTop + badgeHeight) // 左下角
  ctx.closePath()
  ctx.fillStyle = fillColor || '#262626'
  ctx.fill()

  ctx.fillStyle = color || '#fff'
  ctx.font = '15px sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(text || '精选商品', offsetLeft * 2, offsetTop + badgeHeight / 2)
  ctx.restore()
}

function _getTextLine (ctx, { font, text, maxWidth }) {
  let arrText = text.split('')
  let line = ''
  let arrTr = []
  for (let i = 0; i < arrText.length; i++) {
      var testLine = line + arrText[i]
      var metrics = ctx.measureText(testLine)
      var width = metrics.width
      if (width > maxWidth && i > 0) {
        arrTr.push({text: line, width: width})
        line = arrText[i]
        if (arrTr.length == 2) {
          break
        }
      } else {
        line = testLine
      }
      if (i == arrText.length - 1) {
        arrTr.push({text: line, width: width})
      }
  }
  return arrTr
}

/**
 * Generate shared product images with draw in canvas
 * @param {string} canvasId
 * @param {object} customer 分享人
 * @param {object} product 商品信息
 * @param {boolean} isDark 画布背景色是否为暗色
 * @returns None
 */
export default class ProductCanvas {
  constructor(options) {
    this.options = options
  }

  initialize () {
    return new Promise((resolve, reject) => {
      const { canvasId, customer = {}, product, miniqrUrl, isDark = false } = this.options || {}
      if (!miniqrUrl) return
      const query = Taro.createSelectorQuery()
      this.canvas = null
      let ctx = null
      const bgColor = isDark ? 'black' : 'white'
      const colorText = isDark ? 'white' : '#303030'
      const colorTitle = isDark ? 'white' : '#262626'
      const colorTitleLight = isDark ? '#646464' : '#C8C8C8'
      const avatar = _getCanvasImageUrl(_.get(customer, 'avatar', 'https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png?imageView2/2/w/360/ignore-error/1'), 200)
      const full_name = _.get(customer, 'full_name', '')
      const productImage = _getCanvasImageUrl(_.get(product, 'image.src', ''), 800)
      const productTitle = _.get(product, 'title', '')

      query.select(canvasId)
      .fields({ node: true, size: true })
      .exec(async (res) => {
        // init canvas and ctx
        if (!res || !res.length) return;
        this.canvas = res[0].node
        ctx = this.canvas.getContext('2d')
        const canvas_width = 375
        const canvas_height = 820
        this.canvas.width = canvas_width * dpr
        this.canvas.height = canvas_height * dpr
        ctx.scale(dpr, dpr)

        // fill bg
        ctx.font = '14px sans-serif'
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas_width, canvas_height)
        ctx.save()

        let cursorOffsetTop = 0  // 从上往下渲染文字和图片，记录当前光标位置
        cursorOffsetTop += 30

        // TODO: draw logo
        // ctx.drawImage()
        cursorOffsetTop += 65

        // draw user logo and text
        const avatarWidth = 50
        const avatarOffsetLeft = (canvas_width - avatarWidth) / 2
        // const { path: avatarPath } = await Taro.getImageInfo({src: avatar})
        let avatarImage = this.canvas.createImage()
        avatarImage.src = avatar
        await new Promise((resolve, reject) => {
          ;((cursorOffsetTop) => {
            avatarImage.onload = () => {
              ctx.save()
              const avatarRadius = avatarWidth / 2
              ctx.arc(avatarOffsetLeft + avatarRadius, cursorOffsetTop + avatarRadius, avatarRadius, 0, 2 * Math.PI)
              ctx.clip()
              ctx.drawImage(avatarImage, avatarOffsetLeft, cursorOffsetTop, avatarWidth, avatarWidth);
              ctx.restore()
              resolve()
            }
          })(cursorOffsetTop)
        })
        cursorOffsetTop += avatarWidth + 20

        // draw user name and text
        const userText = full_name + '给你分享以下好物'
        const userTextMetrics = ctx.measureText(userText)
        const { width: userTextWidth} = userTextMetrics
        _drawText(ctx, {
          offsetLeft: (canvas_width - userTextWidth) / 2,
          offsetTop: cursorOffsetTop,
          maxWidth: canvas_width,
          align: 'center',
          texts: [
            {fontSize: 14, fontWeight: 'bold', value: full_name, color: colorText},
            {fontSize: 14, fontWeight: '', value: '给你分享以下好物', color: colorText},
          ]
        })
        cursorOffsetTop += 20

        // draw Product Image
        const IMAGE_PADDING = 15
        const productImageWidth = canvas_width - IMAGE_PADDING * 2
        ctx.fillStyle = colorTitleLight
        ctx.fillRect(IMAGE_PADDING, cursorOffsetTop, productImageWidth, productImageWidth)

        if (productImage) {
          let canvasProductImage = this.canvas.createImage()
          canvasProductImage.src = productImage
          await new Promise((resolve, reject) => {
            ;((cursorOffsetTop) => {
              canvasProductImage.onload = () => {
                ctx.drawImage(canvasProductImage, IMAGE_PADDING, cursorOffsetTop, productImageWidth, productImageWidth)
                // draw badge
                _drawBadge(ctx, {
                  offsetLeft: 7,
                  offsetTop: cursorOffsetTop + 25,
                  text: '精选商品',
                  fillColor: '#262626',
                  color: '#ffffff'
                })
                resolve()
              }
            })(cursorOffsetTop)
          })
        } else {
          _drawBadge(ctx, {
            offsetLeft: 7,
            offsetTop: cursorOffsetTop + 25,
            text: '精选商品',
            fillColor: '#262626',
            color: '#ffffff'
          })
        }
        cursorOffsetTop += productImageWidth + 20

        // draw product title
        ctx.save()
        ctx.font = '20px sans-serif'

        // const productTitleMetrics = ctx.measureText(productTitle)
        // const { width: productTitleWidth} = productTitleMetrics
        const textMaxWidth = canvas_width - 60
        const titleLines = _getTextLine(ctx, {
          text: productTitle,
          maxWidth: textMaxWidth
        })
        ctx.textBaseline = 'top'
        _.forEach(titleLines, ({text, width}) => {
          _drawText(ctx, {
            offsetLeft: (canvas_width - width) / 2,
            offsetTop: cursorOffsetTop,
            maxWidth: textMaxWidth,
            align: 'center',
            texts: [
              {fontSize: 20, fontWeight: 'bold', value: text, color: colorTitle},
            ]
          })
          cursorOffsetTop += 20 * 1.4
        })

        // draw tags
        cursorOffsetTop += 20
        ctx.restore()
        const tagsImageWidth = canvas_width - 30 * 2
        let tagsImage = this.canvas.createImage()
        tagsImage.src = 'https://up.img.heidiancdn.com/o_1eh9lrgqd10eok5o9mgbv31s1d0oup22x.png'
        await new Promise((resolve, reject) => {
          ;((cursorOffsetTop) => {
            tagsImage.onload = () => {
              ctx.drawImage(tagsImage, 30, cursorOffsetTop, tagsImageWidth, tagsImageWidth / 16)
              resolve()
            }
          })(cursorOffsetTop)
        })
        cursorOffsetTop += 45

        // draw miniqr
        ctx.restore()
        const miniqrWidth = 100
        let miniqrImage = this.canvas.createImage()
        miniqrImage.src = miniqrUrl
        const miniqrRadius = miniqrWidth / 2
        await new Promise((resolve, reject) => {
          ;((cursorOffsetTop) => {
            miniqrImage.onload = () => {
              ctx.save()
              ctx.fillStyle = '#ffffff'
              ctx.beginPath()
              ctx.arc(canvas_width / 2, cursorOffsetTop + miniqrRadius, miniqrRadius, 0, 2 * Math.PI, false)
              ctx.fill()
              ctx.drawImage(miniqrImage, (canvas_width - miniqrWidth) / 2, cursorOffsetTop, miniqrWidth, miniqrWidth)
              ctx.restore()
              resolve()
            }
          })(cursorOffsetTop)
        })

        // draw tips
        ctx.font = '14px sans-serif'
        ctx.fillStyle = colorTitleLight
        ctx.textBaseline = 'middle'
        const tipsOffsetHeight = cursorOffsetTop + miniqrRadius
        ctx.textAlign = 'right'
        ctx.fillText('识别小程序', canvas_width / 2 - miniqrRadius - 10, tipsOffsetHeight)
        ctx.textAlign = 'left'
        ctx.fillText('进入HeyShop', canvas_width / 2 + miniqrRadius + 10, tipsOffsetHeight)

        setTimeout(() => {
          Taro.canvasToTempFilePath({
            canvas: this.canvas,
            success: (res) => {
              this.tempFilePath = res.tempFilePath
              resolve(res.tempFilePath)
            },
            fail: (err) => {
              console.log('canvasToTempFilePath err: ', err)
            }
          })
        }, 1500)

      })
    })
  }

  saveCanvasToAlbum () {
    if (!this.tempFilePath || this.isSaving) return;
    Taro.showLoading({title: '正在保存'})
    this.isSaving = true
    setTimeout(() => {
      Taro.hideLoading()
      this.isSaving = false
    }, 10000)
    Taro.saveImageToPhotosAlbum({
      filePath: this.tempFilePath,
      success: () => {
        Taro.showModal({
          title: '海报已保存到相册',
          content: '快去分享给好友或朋友圈，让更多小伙伴看到吧',
          showCancel: false,
          confirmText: '我知道了'
        })
      },
      complete: (res) => {
        this.isSaving = false
        Taro.hideLoading()
      }
    })
  }
}


