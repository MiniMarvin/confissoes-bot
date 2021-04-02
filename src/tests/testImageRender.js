const { renderConfession } = require("../renderImage")
const fs = require('fs')

const testRender = async () => {
  const texts = [
    'oi, tudo bem contigo?',
    'queria dizer só que você é legal 🤭 e por isso eu estou deixando essa 💌 aqui assim rsrs...',
    'inclusive eu consigo dar break em textão também haha paosidjfpasodifjsdoifjposdifjaspdoifjsapdofijapsdofijaspdofijsdpfoisfjdiof',
    'Queria dizer que ontem eu stalkiei um rapaz 🕵🏾‍♀️, e o mesmo hoje me mandou mensagem no instagram e falou de mim para um amigo em comum. Sem nem eu ter curtido nada 🥲 to com medo 🥺'
  ]

  renderConfession(texts, 'out.ignore.png', fs)
}

testRender()