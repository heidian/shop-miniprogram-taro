import Taro from '@tarojs/taro'
import _ from 'lodash'

const SHOP_BG_IMG = 'https://up.img.heidiancdn.com/o_1eib7kl4hise1fom1d0h1lem1qln03.jpg?imageView2/2/w/800/ignore-error/1'


const { pixelRatio: dpr } = Taro.getSystemInfoSync()

function _drawText (context, { offsetLeft, offsetTop, maxWidth, texts }) {
  _.forEach(texts, item => {
    context.font = `${item.fontSize || 14}px sans-serif`
    context.fillStyle = item.color
    context.fillText(item.value, offsetLeft, offsetTop, maxWidth)
    if (item.fontWeight === 'bold') {
      context.fillText(item.value, offsetLeft + 0.4, offsetTop, maxWidth)
    }
    offsetLeft += item.value.length * item.fontSize
    context.save()
  })
}

function _getCanvasImageUrl (original_src, width, height, toJpeg, rounded) {
  if (!original_src) return ''
  let url = original_src.split('?')[0]
  url += `?imageMogr2/thumbnail/!${width}x${height || width}r/crop/${width}x${height || width}`
  if (!!toJpeg) url += '/format/jpg'
  if (!!rounded) url += '|roundPic/radiusx/!50p/radiusy/!50p'
  return url
}

function _drawImage(context, { image, offsetLeft, offsetTop, imageWidth, imageHeight }) {
  context.save()
  context.drawImage(image, offsetLeft, offsetTop, imageWidth, imageHeight)
  context.restore()
}

function _drawBadge(context, { offsetLeft, offsetTop, text, fillColor, color }) {
  const badgeHeight = 28, badgeWidth = 90
  context.save()
  context.beginPath()
  context.moveTo(offsetLeft, offsetTop) // badge 左上角
  context.lineTo(offsetLeft + badgeWidth, offsetTop) // 右上角
  context.arcTo(offsetLeft + badgeWidth - badgeHeight / 2, offsetTop + badgeHeight / 2, offsetLeft + badgeWidth, offsetTop + badgeHeight, badgeHeight / 1.7)
  context.lineTo(offsetLeft + badgeWidth, offsetTop + badgeHeight) // 右下角
  context.lineTo(offsetLeft, offsetTop + badgeHeight) // 左下角
  context.closePath()
  context.fillStyle = fillColor || '#262626'
  context.fill()

  context.fillStyle = color || '#fff'
  context.font = '15px sans-serif'
  context.textBaseline = 'middle'
  context.fillText(text || '精选商品', offsetLeft * 2, offsetTop + badgeHeight / 2)
  context.restore()
}

function _getTextLine (context, { font, text, maxWidth }) {
  let arrText = text.split('')
  let line = ''
  let arrTr = []
  for (let i = 0; i < arrText.length; i++) {
      var testLine = line + arrText[i]
      var metrics = context.measureText(testLine)
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

function _imagesPromiseList(canvas, imageSrcList) {
  const promiseList = _.map(imageSrcList, src => {
    return new Promise((resolve, reject) => {
      const image = canvas.createImage()
      image.src = src
      image.onload = () => {
        resolve(image)
      }
    })
  })
  return promiseList
}

/**
 * Generate shared product images with draw in canvas
 * @param {string}  canvasId 当前view中canvas节点的id
 * @param {object}  customer 分享人
 * @param {object}  product 商品信息, 如果没有，则分享店铺
 * @param {boolean} isDark 画布背景色是否为暗色
 * @param {string}  miniqrUrl 初始化时传过来的小程序码图片
 * @returns None
 */
export default class ShareCanvas {
  constructor(options) {
    this.options = options
    this.isProduct = false
    this.ctx = null
    this.canvas = null
    this.canvasWidth = null
    this.canvasHeight = null
    this.canvasImages = {}
    this.cursorOffsetTop = 0
    this.needStop = false
  }

  execGenerate () {
    return new Promise((resolve, reject) => {
      const { canvasId, customer = {}, product, miniqrUrl, isDark = false } = this.options || {}
      if (!miniqrUrl) return
      const bgColor = isDark ? 'black' : 'white'
      const colorText = isDark ? 'white' : '#303030'
      const colorTitle = isDark ? 'white' : '#262626'
      const colorTitleLight = isDark ? '#646464' : '#C8C8C8'
      const titleLogo = 'https://up.img.heidiancdn.com/o_1ehu3f2q4fb5tmt19ql1gcnnic0hite2x.png'
      const avatar = _getCanvasImageUrl(_.get(customer, 'avatar', 'https://up.img.heidiancdn.com/o_1cm7ccaoirfi1tdiutsn6s1odj0rofile.png?imageView2/2/w/360/ignore-error/1'), 100, 100, true, true)
      const tags = 'https://up.img.heidiancdn.com/o_1eh9lrgqd10eok5o9mgbv31s1d0oup22x.png?imageView2/2/w/800/ignore-error/1'
      const full_name = _.get(customer, 'full_name', '')
      if (!_.isEmpty(product)) {
        this.isProduct = true
      }
      const productImage = _getCanvasImageUrl(_.get(product, 'image.src', ''), 800, 800, true)
      const productTitle = _.get(product, 'title', '')

      const canvasImageSrcList =  !!this.isProduct ?
                                  [ titleLogo, avatar, productImage, tags, miniqrUrl ] :
                                  [ SHOP_BG_IMG, avatar, miniqrUrl ]

      const query = Taro.createSelectorQuery()
      query.select(canvasId)
      .fields({ node: true, size: true })
      .exec(async (res) => {
        // init canvas and ctx
        if (!res || !res.length) {
          reject('节点错误');
          return;
        }
        this.canvas = res[0].node
        this.ctx = this.canvas.getContext('2d')
        const canvas_width = 375
        const canvas_height = !!this.isProduct ? 820 : 780
        this.canvasWidth = canvas_width
        this.canvasHeight = canvas_height

        this.canvas.width = canvas_width * dpr
        this.canvas.height = canvas_height * dpr
        this.ctx.scale(dpr, dpr)

        // fill bg
        this._fillBg(bgColor)

        // load images
        const loadError = await this._loadImages(canvasImageSrcList)
        if (loadError) {
          return loadError
        }

        // 从上往下渲染文字和图片，记录当前光标位置
        this.cursorOffsetTop += 30

        if (this.isProduct) {
          // 绘制商品分享
          this._drawTitleLogo()
          this._drawAvatar()
          this._dwarShareTitle(full_name, '给你分享以下好物', colorText)
          this._drawProductImage(colorTitleLight)
          this._drawProductTitle(productTitle, colorTitle)
          this._drawTags()
          this._drawProductMiniQr(colorTitleLight)
        } else {
          // 绘制店铺分享
          this._drawBgShop()
          this._drawAvatar()
          this._dwarShareTitle(full_name, '给你分享一个好店', 'white')
          this._drawShopMiniQr()
        }
        // resolve()
        setTimeout(() => {
          if (!!this.needStop) return;
          Taro.canvasToTempFilePath({
            canvas: this.canvas,
            success: (res) => {
              this.tempFilePath = res.tempFilePath
              resolve(res.tempFilePath)
            },
            fail: (err) => {
              reject(!!this.needStop ? '取消生成图片': err)
            }
          })
        }, 200)
      })
    })
  }

  _drawTitleLogo () {
    // TODO: draw logo  170 x 65
    const titleLogoWidth = 170, titleLogoHeight = 65
    const titleLogoOffsetLeft = (this.canvasWidth - titleLogoWidth) / 2
    _drawImage(this.ctx, {
      image: this.loadedImages.imgTitleLogo,
      offsetLeft: titleLogoOffsetLeft,
      offsetTop: this.cursorOffsetTop,
      imageWidth: titleLogoWidth,
      imageHeight: titleLogoHeight
    })
    this.cursorOffsetTop += 85
  }

  _drawBgShop () {
    _drawImage(this.ctx, {
      image: this.loadedImages.imgShopBg,
      offsetLeft: 0,
      offsetTop: 0,
      imageWidth: this.canvasWidth,
      imageHeight: this.canvasHeight
    })
  }
  _drawAvatar () {
    // draw user logo and text
    const avatarWidth = 50
    const avatarOffsetLeft = (this.canvasWidth - avatarWidth) / 2
    this.ctx.save()
    const avatarRadius = avatarWidth / 2
    this.ctx.arc(avatarOffsetLeft + avatarRadius, this.cursorOffsetTop + avatarRadius, avatarRadius, 0, 2 * Math.PI)
    this.ctx.clip()
    _drawImage(this.ctx, {
      image: this.loadedImages.imgAvatar,
      offsetLeft: avatarOffsetLeft,
      offsetTop: this.cursorOffsetTop,
      imageWidth: avatarWidth,
      imageHeight: avatarWidth
    })
    this.ctx.restore()
    this.cursorOffsetTop += avatarWidth + 20
  }

  _dwarShareTitle (full_name, other_text, colorText) {
    // draw user name and text
    const userText = full_name + other_text
    const userTextMetrics = this.ctx.measureText(userText)
    const { width: userTextWidth} = userTextMetrics
    _drawText(this.ctx, {
      offsetLeft: (this.canvasWidth - userTextWidth) / 2,
      offsetTop: this.cursorOffsetTop,
      maxWidth: this.canvasWidth,
      align: 'center',
      texts: [
        {fontSize: 14, fontWeight: 'bold', value: full_name, color: colorText},
        {fontSize: 14, fontWeight: '', value: other_text, color: colorText},
      ]
    })
    this.cursorOffsetTop += 20
  }

  _drawProductImage (colorTitleLight) {
    // draw Product Image
    const IMAGE_PADDING = 15
    const productImageWidth = this.canvasWidth - IMAGE_PADDING * 2
    this.ctx.fillStyle = colorTitleLight
    this.ctx.fillRect(IMAGE_PADDING, this.cursorOffsetTop, productImageWidth, productImageWidth)
    _drawImage(this.ctx, {
      image: this.loadedImages.imgProduct,
      offsetLeft: IMAGE_PADDING,
      offsetTop: this.cursorOffsetTop,
      imageWidth: productImageWidth,
      imageHeight: productImageWidth
    })
    _drawBadge(this.ctx, {
      offsetLeft: 7,
      offsetTop: this.cursorOffsetTop + 25,
      text: '精选商品',
      fillColor: '#262626',
      color: '#ffffff'
    })
    this.cursorOffsetTop += productImageWidth + 20
  }

  _drawProductTitle (productTitle, colorTitle) {
    // draw product title
    this.ctx.save()
    this.ctx.font = '20px sans-serif'

    const textMaxWidth = this.canvasWidth - 60
    const titleLines = _getTextLine(this.ctx, {
      text: productTitle,
      maxWidth: textMaxWidth
    })
    this.ctx.textBaseline = 'top'
    _.forEach(titleLines, ({text, width}) => {
      _drawText(this.ctx, {
        offsetLeft: (this.canvasWidth - width) / 2,
        offsetTop: this.cursorOffsetTop,
        maxWidth: textMaxWidth,
        align: 'center',
        texts: [
          {fontSize: 20, fontWeight: 'bold', value: text, color: colorTitle},
        ]
      })
      this.cursorOffsetTop += 20 * 1.4
    })
  }

  _drawTags () {
    // draw tags
    this.cursorOffsetTop += 20
    this.ctx.restore()
    const tagsImageWidth = this.canvasWidth - 30 * 2
    _drawImage(this.ctx, {
      image: this.loadedImages.imgTags,
      offsetLeft: 30,
      offsetTop: this.cursorOffsetTop,
      imageWidth: tagsImageWidth,
      imageHeight: tagsImageWidth / 16
    })
    this.cursorOffsetTop += 45
  }

  _drawProductMiniQr (colorTitleLight) {
    // draw miniqr
    this.ctx.restore()
    const miniqrWidth = 100
    const miniqrRadius = miniqrWidth / 2
    _drawImage(this.ctx, {
      image: this.loadedImages.imgMiniqr,
      offsetLeft: (this.canvasWidth - miniqrWidth) / 2,
      offsetTop: this.cursorOffsetTop,
      imageWidth: miniqrWidth,
      imageHeight: miniqrWidth
    })

    // draw tips
    this.ctx.font = '14px sans-serif'
    this.ctx.fillStyle = colorTitleLight
    this.ctx.textBaseline = 'middle'
    const tipsOffsetHeight = this.cursorOffsetTop + miniqrRadius
    this.ctx.textAlign = 'right'
    this.ctx.fillText('识别小程序', this.canvasWidth / 2 - miniqrRadius - 10, tipsOffsetHeight)
    this.ctx.textAlign = 'left'
    this.ctx.fillText('进入HeyShop', this.canvasWidth / 2 + miniqrRadius + 10, tipsOffsetHeight)
  }

  _drawShopMiniQr () {
    this.ctx.restore()
    const miniqrWidth = 80
    _drawImage(this.ctx, {
      image: this.loadedImages.imgMiniqr,
      offsetLeft: 30,
      offsetTop: this.canvasHeight - miniqrWidth - 10,
      imageWidth: miniqrWidth,
      imageHeight: miniqrWidth
    })
  }

  _fillBg (bgColor) {
    this.ctx.font = '14px sans-serif'
    this.ctx.fillStyle = bgColor
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.ctx.save()
  }

  async _loadImages (canvasImageSrcList) {
    let loadedImages = null
    try {
      loadedImages = await Promise.all(_imagesPromiseList(this.canvas, canvasImageSrcList))
    } catch (error) {
      return error
    }

    if (this.isProduct) {
      const [ imgTitleLogo, imgAvatar, imgProduct, imgTags, imgMiniqr ] = loadedImages
      this.loadedImages = {
        imgTitleLogo,
        imgAvatar,
        imgProduct,
        imgTags,
        imgMiniqr
      }
    } else {
      const [ imgShopBg, imgAvatar, imgMiniqr ] = loadedImages
      this.loadedImages = {
        imgShopBg,
        imgAvatar,
        imgMiniqr
      }
    }
    return null
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

  stopTask () {
    this.needStop = true
  }
}


