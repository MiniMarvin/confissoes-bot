const Twitter = require('twitter')

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

module.exports.client = client
