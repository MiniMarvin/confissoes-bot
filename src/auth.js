const crypto = require('crypto')

// TODO: implementar a validação de autenticação do twitter
module.exports.twitterAuth = async (userId) => {
  return true
}

/**
 * Creates a HMAC SHA-256 hash created from the app TOKEN and
 * your app Consumer Secret.
 * @param  crc_token  Token para processar o CRC dos dados.
 * @param  consumer_secret  Segredo de consumer do twitter.
 * @return string
 */
module.exports.crcChallenge = (crc_token, consumer_secret) => {
  let hmac = crypto
    .createHmac('sha256', consumer_secret)
    .update(crc_token)
    .digest('base64')

  return hmac
}
