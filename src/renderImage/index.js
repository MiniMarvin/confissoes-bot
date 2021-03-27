const pimage = require('pureimage')
const opentype = require('opentype.js')
const stream = require('stream')
// const MemoryFileSystem = require("memory-fs");
// const fs = require('fs')
// const fs = new MemoryFileSystem()
const { fs } = require('memfs')
const pathModule = require('path')
const { loadFont } = require('./textRender')
const { computeBubble, computeCanvas } = require('./compute')

const borderRadius = 20
const fontPath = pathModule.resolve(__dirname, '../assets/Roboto-Regular.ttf')
/**
 * @type {opentype.Font}
 */
let font = null

/**
 * Renderiza uma mensagem em uma bolha no board.
 *
 * @param {{
    lines: {
        text: string;
        y: number;
        width: number;
    }[];
    width: number;
    height: number;
  }} bubbleInfo O texto que deve ser renderizado na bolha.
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

  console.log('bubble infos:', bubbleInfo)

  console.log(
    'drawing bubble at x:',
    margin,
    'and y:',
    y,
    'and width:',
    bubbleInfo.width,
    'and height:',
    bubbleInfo.height,
    'width borderRadius:',
    borderRadius
  )

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
  // TODO: setup the messages that stay in each part of the message
  bubbleInfo.lines.forEach((line) => {
    console.log(
      "draw line '",
      line.text,
      "' at x:",
      margin + padding,
      'and y:',
      line.y
    )
    ctx.fillText(line.text, margin + padding, y + line.y)
  })
}

/**
 * Renderiza uma lista de mensagens como se fossem mensagens do twitter.
 *
 * @param {string[]} messages Lista de mensagens a ser colocadas em bolhas.
 * @param {string} outFilePath Nome do arquivo de saída no sistema de arquivos.
 * @param {any} fs O sistema de arquivos que deve ser utilizado.
 * @returns {IWriteStream} PNG Image
 */
const renderConfession = async (messages, outFilePath, fs) => {
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
  console.log('canvas info:', canvasInfo)

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
        console.log('wrote out the png file to out.png')
        console.log(image)
        resolve(image)
      })
      .catch((e) => {
        console.log('there was an error writing')
        console.trace(e)
        reject(e)
      })
  })
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

const testRender = async () => {
  const texts = [
    'oi, tudo bem contigo?',
    'queria dizer só que você é legal ;D e por isso eu estou deixando essa mensagem aqui assim rsrs...',
    'inclusive eu consigo dar break em textão também haha paosidjfpasodifjsdoifjposdifjaspdoifjsapdofijapsdofijaspdofijsdpfoisfjdiof',
  ]

  renderConfession(texts, '/out.png', fs)
}

testRender()
