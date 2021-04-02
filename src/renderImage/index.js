const pimage = require('pureimage')
const opentype = require('opentype.js')
const pathModule = require('path')
const { loadFont } = require('./textUtils')
const { computeCanvas } = require('./compute')
const { removeEmojis, loadEmoji } = require('./emoji')
const Context = require('pureimage/src/context')

const borderRadius = 20
const fontPath = pathModule.resolve(__dirname, '../assets/Roboto-Regular.ttf')
/**
 * @type {opentype.Font}
 */
let font = null

/**
 * Desenha uma bolha de chat inicial do twitter.
 *
 * @param {number} x O top left x da bolha.
 * @param {number} y O top left y da bolha.
 * @param {number} width A largura da bolha.
 * @param {number} height A altura da bolha.
 * @param {number} cornerRadius O border radius da chat bubble.
 * @param {Context} ctx Contexto de desenho 2d.
 */
const drawChatBubble = (x, y, width, height, cornerRadius, ctx) => {
  // draw a bigger rectangle, and 2 other rectangles and 3 circles
  ctx.fillRect(x + cornerRadius, y, width - 2 * cornerRadius, height)
  ctx.fillRect(x, y + cornerRadius, cornerRadius, height - 1 * cornerRadius)
  ctx.fillRect(
    x + width - cornerRadius,
    y + cornerRadius,
    cornerRadius,
    height - 2 * cornerRadius
  )

  // left top
  ctx.beginPath()
  ctx.arc(x + cornerRadius, y + cornerRadius, cornerRadius, 0, Math.PI, true)
  ctx.closePath()
  ctx.fill()

  // right top
  ctx.beginPath()
  ctx.arc(
    x + width - cornerRadius,
    y + cornerRadius,
    cornerRadius,
    0,
    Math.PI,
    true
  )
  ctx.closePath()
  ctx.fill()

  // right bottom
  ctx.beginPath()
  ctx.arc(
    x + width - cornerRadius,
    y + height - cornerRadius,
    cornerRadius,
    Math.PI,
    Math.PI,
    true
  )
  ctx.closePath()
  ctx.fill()
}

/**
 * Desenha uma bolha de meio de chat do twitter.
 *
 * @param {number} x O top left x da bolha.
 * @param {number} y O top left y da bolha.
 * @param {number} width A largura da bolha.
 * @param {number} height A altura da bolha.
 * @param {number} cornerRadius O border radius da chat bubble.
 * @param {Context} ctx Contexto de desenho 2d.
 */
const drawMidBubble = (x, y, width, height, cornerRadius, ctx) => {
  // draw a bigger rectangle, and 2 other rectangles and 3 circles
  ctx.fillRect(x + cornerRadius, y, width - 2 * cornerRadius, height)
  ctx.fillRect(x, y, cornerRadius, height)
  ctx.fillRect(
    x + width - cornerRadius,
    y + cornerRadius,
    cornerRadius,
    height - 2 * cornerRadius
  )

  // right top
  ctx.beginPath()
  ctx.arc(
    x + width - cornerRadius,
    y + cornerRadius,
    cornerRadius,
    0,
    Math.PI,
    true
  )
  ctx.closePath()
  ctx.fill()

  // right bottom
  ctx.beginPath()
  ctx.arc(
    x + width - cornerRadius,
    y + height - cornerRadius,
    cornerRadius,
    Math.PI,
    Math.PI,
    true
  )
  ctx.closePath()
  ctx.fill()
}

/**
 * Promise para realizar a definição de uma fonte no pureImage.
 *
 * @returns {Promise<void>}
 */
const setFont = async (path) => {
  let font = null
  // get the font with the open type library

  return new Promise((resolve, reject) => {
    try {
      // Register the font in the pureImage lib
      const fnt = pimage.registerFont(path)
      fnt.load(() => {
        resolve()
      })
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Renderiza uma mensagem em uma bolha no board.
 *
 * @param {{
 *    lines: {
 *      text: string,
 *      y: number,
 *      width: number,
 *      emojis: {
 *        x: number,
 *        y: number,
 *        width: number,
 *        height: number,
 *        url: string,
 *        emoji: string,
 *        index: number
 *      }[]
 *    }[],
 *    width: number,
 *    height: number
 * }} bubbleInfo O texto que deve ser renderizado na bolha.
 * @param {number} x A posição x inicial.
 * @param {number} y A posição y inicial.
 * @param {number} padding O padding interno da bolha.
 * @param {number} fontSize O tamanho da fonte.
 * @param {boolean} isFirst Verifica se é uma mensagem inicial.
 * @param {Context} ctx O contexto em que precisa ser renderizado.
 */
const renderMessage = async (
  bubbleInfo,
  x,
  y,
  padding,
  fontSize,
  isFirst,
  ctx
) => {
  ctx.fillStyle = 'rgba(66,83,99,1)'
  const margin = x

  if (isFirst)
    drawChatBubble(
      margin,
      y,
      bubbleInfo.width,
      bubbleInfo.height,
      borderRadius,
      ctx
    )
  else
    drawMidBubble(
      margin,
      y,
      bubbleInfo.width,
      bubbleInfo.height,
      borderRadius,
      ctx
    )

  ctx.fillStyle = '#ffffff'
  ctx.font = `${fontSize}pt 'Roboto'`
  let emojiPromises = []
  // TODO: setup the messages that stay in each part of the message
  const linePromises = bubbleInfo.lines.map(async (line) => {
    const promises = line.emojis.map(async (emojiData) => {
      let emoji = await loadEmoji(emojiData.url)
      ctx.drawImageWithAlpha(
        emoji,
        0,
        0,
        emoji.width,
        emoji.height,
        margin + padding + emojiData.x,
        y + emojiData.y,
        emojiData.width,
        emojiData.height
      )
    })
    emojiPromises = [...emojiPromises, ...promises]

    ctx.fillText(removeEmojis(line.text), margin + padding, y + line.y)
  })

  await Promise.all([...linePromises, ...emojiPromises])
}

/**
 * Renderiza uma lista de mensagens como se fossem mensagens do twitter.
 *
 * @param {string[]} messages Lista de mensagens a ser colocadas em bolhas.
 * @param {string} outFilePath Nome do arquivo de saída no sistema de arquivos.
 * @param {any} fs O sistema de arquivos que deve ser utilizado.
 * @returns {IWriteStream} PNG Image
 */
module.exports.renderConfession = async (messages, outFilePath, fs) => {
  const fontSize = 36
  const maxWidth = 960
  const bubblePadding = 30
  const bubbleSpacing = 10
  const horizontalPadding = 30
  const verticalPadding = 60

  if (!font) font = await loadFont(fontPath)
  const canvasInfo = computeCanvas(
    messages,
    font,
    fontSize,
    maxWidth,
    bubblePadding,
    bubbleSpacing
  )

  const width = canvasInfo.width + 2 * bubblePadding
  const height = canvasInfo.height + 2 * verticalPadding

  const confession = pimage.make(width, height)
  const ctx = confession.getContext('2d')

  ctx.fillStyle = 'rgba(23,31,42,1)'
  ctx.fillRect(0, 0, width, height)

  const setFontContextPromise = setFont(fontPath)
  await setFontContextPromise

  let startx = horizontalPadding
  let starty = verticalPadding

  for (let i = 0; i < canvasInfo.bubbles.length; i++) {
    const bubbleInfo = canvasInfo.bubbles[i]
    await renderMessage(
      bubbleInfo,
      startx,
      starty,
      bubblePadding,
      fontSize,
      i === 0,
      ctx,
      fontSize
    )
    starty += bubbleInfo.height + bubbleSpacing
  }

  // TODO: create in memory stream to output to the twitter api
  let image = fs.createWriteStream(outFilePath)
  return new Promise((resolve, reject) => {
    pimage
      // .encodePNGToStream(confession, fs.createWriteStream('out.png'))
      .encodePNGToStream(confession, image)
      .then(() => {
        resolve(image)
      })
      .catch((e) => {
        reject(e)
      })
  })
}

/**
 * Provides different ways to draw an image onto the canvas.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 *
 * @param {Bitmap} bitmap An instance of the {@link Bitmap} class to use for drawing
 * @param {number} sx     The X coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
 * @param {number} sy     The Y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
 * @param {number} sw     The width of the sub-rectangle of the source {@link Bitmap} to draw into the destination context. If not specified, the entire rectangle from the coordinates specified by `sx` and `sy` to the bottom-right corner of the image is used.
 * @param {number} sh     The height of the sub-rectangle of the source {@link Bitmap} to draw into the destination context.
 * @param {number} dx     The X coordinate in the destination canvas at which to place the top-left corner of the source {@link Bitmap}
 * @param {number} dy     The Y coordinate in the destination canvas at which to place the top-left corner of the source {@link Bitmap}
 * @param {number} dw     The width to draw the {@link Bitmap} in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in width when drawn
 * @param {number} dh     The height to draw the {@link Bitmap} in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in height when drawn
 *
 * @returns {void}
 *
 * @memberof Context
 */
Context.prototype.drawImageWithAlpha = function (
  bitmap,
  sx,
  sy,
  sw,
  sh,
  dx,
  dy,
  dw,
  dh
) {
  // two argument form
  if (typeof sw === 'undefined')
    return this.drawImage(
      bitmap,
      0,
      0,
      bitmap.width,
      bitmap.height,
      sx,
      sy,
      bitmap.width,
      bitmap.height
    )
  // four argument form
  if (typeof dx === 'undefined')
    return this.drawImage(
      bitmap,
      0,
      0,
      bitmap.width,
      bitmap.height,
      sx,
      sy,
      sw,
      sh
    )
  for (var i = 0; i < dw; i++) {
    var tx = i / dw
    var ssx = Math.floor(tx * sw) + sx
    for (var j = 0; j < dh; j++) {
      var ty = j / dh
      var ssy = sy + Math.floor(ty * sh)
      var rgba = bitmap.getPixelRGBA(ssx, ssy)
      if (rgba & 0b11111111) {
        this.bitmap.setPixelRGBA(dx + i, dy + j, rgba)
      }
    }
  }
}
