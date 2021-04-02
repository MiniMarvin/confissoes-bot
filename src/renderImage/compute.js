const { removeEmojis, extractEmojisFromString } = require('./emoji')
const { measureText, getIndexPositionInString } = require('./textUtils')

/**
 * Calcula o tamanho que uma bolha de mensagem vai ocupar
 *
 * @param {string} text O texto a ser renderizado.
 * @param {string} font A fonte que o texto vai renderizar.
 * @param {string} fontSize O texto a ser renderizado.
 * @param {number} maxWidth Largura máxima que um texto pode ocupar.
 * @param {number} padding Padding da bolha para o texto.
 *
 * @returns {{
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
 * }}
 */
module.exports.computeBubble = (text, font, fontSize, maxWidth, padding) => {
  const words = text.trim().split(' ')
  let wordCount = 0
  /**
   * @type {{text: string, y: number, width: number}}
   */
  const lines = []
  let str = ''
  let bubbleWidth = 0
  let verticalPosition = padding

  const whitespaceMeasure = measureText(' ', font, fontSize)
  const emojiSize = 3 * whitespaceMeasure.width

  for (let i = 0; i < words.length + 1; i++) {
    const word = words[i]
    // verifica se a palavra que já está registrada ultrapassa o tamanho da string atual
    if (wordCount > 0) {
      const measures = measureText(str, font, fontSize)
      let substrMeasure = null
      if (measures.width > maxWidth) {
        let splitPoint = 0
        for (let j = 0; j < str.length; j++) {
          let tmpMeasure = measureText(str.slice(0, j + 1), font, fontSize)

          if (tmpMeasure.width > maxWidth) {
            break
          }

          substrMeasure = tmpMeasure
          splitPoint = j
        }

        // Atualiza o ponteiro de operação
        verticalPosition += substrMeasure.emHeightAscent
        const line = str.slice(0, splitPoint)
        const emojis = extractEmojisFromString(line)
        const enrichedEmojis = emojis.map((emojiData) => ({
          ...emojiData,
          x: getIndexPositionInString(line, emojiData.index, font, fontSize),
          y: verticalPosition - emojiSize,
          width: emojiSize,
          height: emojiSize,
        }))

        lines.push({
          text: removeEmojis(line),
          y: verticalPosition,
          width: substrMeasure.width,
          emojis: enrichedEmojis,
        })
        verticalPosition += Math.abs(substrMeasure.emHeightDescent)
        bubbleWidth = Math.max(bubbleWidth, substrMeasure.width)

        str = str.slice(splitPoint)
        i--
        continue
      }
    }

    if (word) {
      let tmpStr = ''
      if (!str) tmpStr = word
      else tmpStr = `${str} ${word}`

      const measures = measureText(tmpStr, font, fontSize)
      const lineWidth = measures.width
      if (lineWidth > maxWidth) {
        const originalMeasure = measureText(str, font, fontSize)
        verticalPosition += originalMeasure.emHeightAscent

        const emojis = extractEmojisFromString(str)
        const enrichedEmojis = emojis.map((emojiData) => ({
          ...emojiData,
          x: getIndexPositionInString(str, emojiData.index, font, fontSize),
          y: verticalPosition - emojiSize,
          width: emojiSize,
          height: emojiSize,
        }))

        lines.push({
          text: str,
          y: verticalPosition,
          width: originalMeasure.width,
          emojis: enrichedEmojis,
        })

        verticalPosition += Math.abs(originalMeasure.emHeightDescent)
        bubbleWidth = Math.max(bubbleWidth, originalMeasure.width)

        wordCount = 1
        str = word
      } else {
        str = tmpStr
      }
    } else {
      const originalMeasure = measureText(str, font, fontSize)
      verticalPosition += originalMeasure.emHeightAscent

      const emojis = extractEmojisFromString(str)
      const enrichedEmojis = emojis.map((emojiData) => ({
        ...emojiData,
        x: getIndexPositionInString(str, emojiData.index, font, fontSize),
        y: verticalPosition - emojiSize,
        width: emojiSize,
        height: emojiSize,
      }))

      lines.push({
        text: str,
        y: verticalPosition,
        width: originalMeasure.width,
        emojis: enrichedEmojis,
      })
      verticalPosition += Math.abs(originalMeasure.emHeightDescent)
      bubbleWidth = Math.max(bubbleWidth, originalMeasure.width)
      str = ''
    }
  }

  return {
    lines: lines,
    width: bubbleWidth + 2 * padding,
    height: verticalPosition + padding,
  }
}

/**
 * Calcula o tamanho que um canvas com múltiplas bolhas vai ocupar
 *
 * @param {string[]} texts O texto a ser renderizado.
 * @param {string} font A fonte que o texto vai renderizar.
 * @param {string} fontSize O texto a ser renderizado.
 * @param {number} maxWidth Largura máxima que um texto pode ocupar.
 * @param {number} padding Padding da bolha para o texto.
 *
 * @returns {{bubbles: {lines: {text: string, y: number, width: number}[], width: number, height: number}[], width: number, height: number}}
 */
module.exports.computeCanvas = (
  texts,
  font,
  fontSize,
  maxWidth,
  padding,
  bubbleSpacing
) => {
  const bubbles = texts.map((text) =>
    this.computeBubble(text, font, fontSize, maxWidth, padding)
  )
  const width = bubbles.reduce(
    (prev, current) => Math.max(prev, current.width),
    0
  )
  const height = bubbles.reduce(
    (prev, current) => prev + current.height + bubbleSpacing,
    -bubbleSpacing
  )

  return {
    bubbles: bubbles,
    width: width,
    height: height,
  }
}
