'use strict'

const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const { crcChallenge } = require('./auth')

module.exports.twitterHandler = async (event, context, callback) => {
  // Logs the event just to verify latter
  console.log(JSON.stringify(event))

  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Ok!',
        input: event,
      },
      null,
      2
    ),
  }

  // validate if the event is DM message event, otherwise ignore.
  if (
    response.direct_message_events != null &&
    response.direct_message_events.length > 0
  ) {
    // TODO: melhorar o processamento de texto
    
  } else {
    callback(null, response)
    return
  }

  callback(null, response)
}

module.exports.twitterCrc = async (event, context, callback) => {
  const crcToken = event.queryStringParameters.crc_token
  const consumerSecret = process.env.TWITTER_CONSUMER_API_KEY_SECRET
  const token = crcChallenge(crcToken, consumerSecret)

  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        response_token: 'sha256=' + token,
      },
      null,
      2
    ),
  }

  callback(null, response)
}

module.exports.status = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Ok!',
        input: event,
      },
      null,
      2
    ),
  }

  callback(null, response)
}

module.exports.createPost = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body)
  const text = requestBody.text

  if (!text) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'text message must not be null',
        input: event,
      }),
    }

    callback(response, null)
  }

  // TODO: auth the user to make a post or use recaptcha to avoid bots
  // TODO: integrate with the tweeter api to send a tweet in the account

  const date = new Date().toISOString()
  const tableData = {
    TableName: process.env.MESSAGES_TABLE,
    Item: {
      date: date,
      text: text,
      userId: '',
      tweetId: '',
    },
  }

  try {
    await dynamoDb.put(tableData).promise()
  } catch (err) {
    console.trace(err)
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: err,
        input: event,
      }),
    }

    callback(response, null)
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'message inserted',
      input: event,
    }),
  }

  callback(null, response)
}

module.exports.listPostsForUser = async (event, context, callback) => {}

module.exports.getPost = async (event, context, callback) => {
  // TODO: implement the method to get a post from it's id with security analysis
}

module.exports.telegramHandler = async (event, context, callback) => {}
