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