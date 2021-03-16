const crypto = require("crypto")

// TODO: implementar a validação de autenticação do twitter
module.exports.twitterAuth = async (userId) => {
  return true
}

/**
 * Creates a HMAC SHA-256 hash created from the app TOKEN and
 * your app Consumer Secret.
 * @param  token  the token provided by the incoming GET request
 * @return string
 */
module.exports.crcChallenge = (crc_token, consumer_secret) => {
  let hmac = crypto
    .createHmac("sha256", consumer_secret)
    .update(crc_token)
    .digest("base64")

  return hmac
}
