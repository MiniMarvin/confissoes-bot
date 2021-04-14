const opentype = require('opentype.js')

/**
 * Measure text size
 *
 * @param {string} text The name to give the font
 * @param {opentype.Font} font The font that is being used
 * @param {number} fontSize The number of points in the font
 *
 * @returns {{width: number, emHeightAscent: number, emHeightDescent: number}}}
 */
module.exports.measureText = (text, font, fontSize) => {
  const fsize = fontSize
  const glyphs = font.stringToGlyphs(text)
  let advance = 0
  glyphs.forEach((g) => {
    advance += g.advanceWidth
  })

  return {
    width: (advance / font.unitsPerEm) * fsize,
    emHeightAscent: (font.ascender / font.unitsPerEm) * fsize,
    emHeightDescent: (font.descender / font.unitsPerEm) * fsize,
  }
}

/**
 * Carrega uma fonte no opentype.
 *
 * @param {string} path O caminho da fonte
 * @returns {Promise<opentype.Font>}
 */
module.exports.loadFont = (path) => {
  return new Promise((resolve, reject) => {
    opentype.load(path, function (err, font) {
      if (err) reject(err)
      resolve(font)
    })
  })
}

/**
 * Get the X position of the glyph in the index "pos" when text is rendered.
 *
 * @param {string} str The string to extract the info.
 * @param {number} pos The char position of the character to get the begining.
 * @param {opentype.Font} font The font used to render.
 * @param {number} fontSize The size of the font.
 */
module.exports.getIndexPositionInString = (str, pos, font, fontSize) => {
  const measures = module.exports.measureText(str.slice(0, pos), font, fontSize)
  return measures.width
}
