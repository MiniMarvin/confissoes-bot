const { renderConfession } = require('../renderImage')
const { postMedia } = require('../twitterManager')
const { fs } = require('memfs')
// const fs = require('fs')

const main = async () => {
  const messages = [
    'eu só queria dizer que estou muito feliz sabe?',
    'afinal o serviço finalmente está funcionando como devia =D',
  ]

  const filePath = '/out.png'
  await renderConfession(messages, filePath, fs)

  try {
    const tweet = await postMedia('mais um post...', filePath, fs)
    console.log(tweet)
  } catch (err) {
    console.trace(err)
  }
}

main()
