const { sendDm } = require('../twitterManager')

const main = async () => {
  const userId = process.env.USER_ID
  try {
    console.log('trying to message ', userId)
    const dt = await sendDm('oi, tudo bem?', userId)
    console.log(dt.data)
  } catch (err) {
    console.trace(err)
  }
}

main()
