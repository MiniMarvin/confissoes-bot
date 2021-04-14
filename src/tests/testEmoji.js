const { extractEmojisFromString, loadEmoji } = require('../renderImage/emoji')
const pimage = require('pureimage')
const { getIndexPositionInString, loadFont } = require('../renderImage/textUtils')
const pathModule = require('path')
const fs = require('fs')

const main = async () => {
  const fontPath = pathModule.resolve(__dirname, '../assets/Roboto-Regular.ttf')
  const font = await loadFont(fontPath)
  const fontSize = 50

  const text = 'hello world! 👁👄👁'
  const emojis = extractEmojisFromString(text)
  const enrichedEmojis = emojis.map((emojiData) => ({
    ...emojiData,
    x: getIndexPositionInString(text, emojiData.index, font, fontSize),
  }))

  const width = 120,
    height = 50
  const img = pimage.make(width, height)
  const ctx = img.getContext('2d')

  let emoji = await loadEmoji(enrichedEmojis[0].url)
  ctx.drawImage(emoji, 0, 0, emoji.width, emoji.height, 10, 10, 30, 30)
  emoji = await loadEmoji(enrichedEmojis[1].url)
  ctx.drawImage(emoji, 0, 0, emoji.width, emoji.height, 45, 10, 30, 30)
  emoji = await loadEmoji(enrichedEmojis[2].url)
  ctx.drawImage(emoji, 0, 0, emoji.width, emoji.height, 80, 10, 30, 30)

  await pimage.encodePNGToStream(img, fs.createWriteStream('emoji.ignore.png'))
}

main()
