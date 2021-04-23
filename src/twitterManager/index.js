const Twitter = require('twitter')
const axios = require('axios')
const crypto = require('crypto')
const OAuth = require('oauth-1.0a')

const oauth = OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_API_KEY,
    secret: process.env.TWITTER_CONSUMER_API_KEY_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (base_string, key) => {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64')
  },
  body_hash_function: (base_string, key) => {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64')
  },
})

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_API_KEY_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

module.exports.postMedia = (message, filePath, fs) => {
  // Load your image
  const data = fs.readFileSync(filePath)

  // Make post request on media endpoint. Pass file data as media parameter
  return new Promise((resolve, reject) => {
    client.post(
      'media/upload',
      { media: data },
      function (error, media, response) {
        if (!error) {
          // If successful, a media object will be returned.
          // console.log(media)

          // Lets tweet it
          const status = {
            status: message,
            media_ids: media.media_id_string, // Pass the media id string
          }

          client.post(
            'statuses/update',
            status,
            function (error, tweet, response) {
              if (!error) {
                resolve(tweet)
              } else {
                reject(error)
              }
            }
          )
        }
      }
    )
  })
}

module.exports.sendDm = async (message, userId) => {
  const token = {
    key: process.env.TWITTER_ACCESS_TOKEN,
    secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  }
  const request_data = {
    url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
    method: 'POST',
    data: {
      event: {
        type: 'message_create',
        message_create: {
          target: { recipient_id: userId },
          message_data: { text: message },
        },
      },
    },
    includeBodyHash: true,
  }

  const authorization = oauth.toHeader(oauth.authorize(request_data, token))
  request_data.headers = {
    ...authorization,
    'Content-Type': 'application/json',
  }

  return axios.post(request_data.url, request_data.data, {
    headers: request_data.headers,
  })
}

module.exports.client = client
