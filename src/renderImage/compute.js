const { measureText } = require('./textRender')

/**
 * Calcula o tamanho que uma bolha de mensagem vai ocupar
 *
 * @param {string} text O texto a ser renderizado.
 * @param {string} font A fonte que o texto vai renderizar.
 * @param {string} fontSize O texto a ser renderizado.
 * @param {number} maxWidth Largura máxima que um texto pode ocupar.
 * @param {number} padding Padding da bolha para o texto.
 *
 * @returns {{lines: {text: string, y: number, width: number}[], width: number, height: number}}
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
        lines.push({
          text: str.slice(0, splitPoint),
          y: verticalPosition,
          width: substrMeasure.width,
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
        lines.push({
          text: str,
          y: verticalPosition,
          width: originalMeasure.width,
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
      lines.push({
        text: str,
        y: verticalPosition,
        width: originalMeasure.width,
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

module.exports.computeCanvas = () => {}
