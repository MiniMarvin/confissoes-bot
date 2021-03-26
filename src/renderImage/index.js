const pimage = require('pureimage')
const stream = require('stream')
const fs = require('fs')

const borderRadius = 20

/**
 * Renderiza uma mensagem em uma bolha no board.
 * 
 * @param {string} text O texto que deve ser renderizado na bolha.
 * @param {number} y A posição y inicial.
 * @param {boolean} start Verifica se é uma mensagem inicial.
 * @param {Context} ctx O contexto em que precisa ser renderizado.
 */
const renderMessage = async (text, y, start, ctx) => {
  ctx.fillStyle = 'rgba(66,83,99,1)'

  // TODO: compute bubble width
  // TODO: compute bubble height
  const bubbleWidth = 420
  const bubbleHeight = 60
  if (start) drawChatBubble(15, y, bubbleWidth, bubbleHeight, borderRadius, ctx)
  else drawMidBubble(15, y, 420, 60, 20, ctx)
  
  ctx.fillStyle = '#ffffff'
  ctx.font = "18pt 'Roboto'"
  // TODO: setup the messages that stay in each part of the message
  const parts = [text]
  for (let p of parts) {
    ctx.fillText(p, 30, 65)
  }
}

/**
 * Renderiza uma lista de mensagens como se fossem mensagens do twitter. 
 * 
 * @param {string[]} messages Lista de mensagens a ser colocadas em bolhas
 */
const renderConfession = async (messages) => {
  const width = 640
  const height = 800
  const confession = pimage.make(width, height)
  const ctx = confession.getContext('2d')
  ctx.fillStyle = 'rgba(23,31,42,1)'
  ctx.fillRect(0, 0, width, height)

  await setFont()

  for (let text of messages) {
    renderMessage(text, 30, true, ctx)
  }

  // TODO: create in memory stream to output to the twitter api
  pimage
    .encodePNGToStream(confession, fs.createWriteStream('out.png'))
    .then(() => {
      console.log('wrote out the png file to out.png')
    })
    .catch((e) => {
      console.log('there was an error writing')
    })
}

const testRender = async () => {
  const texts = ['oi, tudo bem contigo? queria dizer só que você é legal']

  renderConfession(texts)
}

/**
 * Promise para realizar a definição de uma fonte no pureImage. 
 * 
 * @returns Promise<void>
 */
const setFont = async () => {
  return new Promise((resolve, reject) => {
    try {
      const fnt = pimage.registerFont(
        '/Users/caiogomes/Documents/projects/channel/indiretas-api/src/assets/Roboto-Regular.ttf',
        'Roboto'
      )
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
  ctx.fillRect(x, cornerRadius, cornerRadius, height - 1 * cornerRadius)
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

testRender()
