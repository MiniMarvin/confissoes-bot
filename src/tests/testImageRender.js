const { renderConfession } = require("../renderImage")
const fs = require('fs')

const testRender = async () => {
  const texts = [
    'oi, tudo bem contigo?',
    'queria dizer só que você é legal ;D e por isso eu estou deixando essa mensagem aqui assim rsrs...',
    'inclusive eu consigo dar break em textão também haha paosidjfpasodifjsdoifjposdifjaspdoifjsapdofijapsdofijaspdofijsdpfoisfjdiof',
  ]

  renderConfession(texts, 'out.png', fs)
}

testRender()