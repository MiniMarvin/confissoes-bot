'use strict'

const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const { crcChallenge } = require('./auth')
const {
  alreadyInQueue,
  addMessagesToConfession,
  addConfession,
} = require('./dynamo/messageStorage')
const { selectAction } = require('./processMessages')
const { pushToQueue } = require('./sqs/manageQueue')

const messageTableName = process.env.MESSAGES_TABLE
console.log('messages table: ', messageTableName)

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

  const request = JSON.parse(event.body)

  // validate if the event is DM message event, otherwise ignore.
  if (request.direct_message_events?.length > 0) {
    // TODO: melhorar o processamento de texto
    // Obs: Da forma que está implementado pode ocorrer um problema caso venham multiplos ids em uma única chamada
    console.log('selecting action')
    const actionPayload = selectAction(request)
    const userId = request.for_user_id

    if (actionPayload.action === 'CONFESS') {
      console.log('detected confession')
      const ongoingConfession = await alreadyInQueue(
        userId,
        messageTableName,
        dynamoDb
      )

      console.log('has ongoing confession?', ongoingConfession)

      if (!ongoingConfession) {
        const timestamp = actionPayload.messages
          .map((event) => event.timestamp)
          .reduce((prev, current) => (current < prev ? current : prev))

        console.log('pushing to queue...')
        pushToQueue({
          userId: actionPayload.messages[0].userId,
          timestamp: timestamp,
        })

        console.log('adding confession...')
        addConfession(
          actionPayload.messages,
          userId,
          timestamp,
          messageTableName,
          dynamoDb
        )
      } else {
        console.log('adding messages to confession...')

        await addMessagesToConfession(
          actionPayload.messages,
          userId,
          messageTableName,
          dynamoDb
        )
      }
    } else if (actionPayload.action === 'CANCEL_CONFESSION') {
      console.log('canceling confession')
      const userId = actionPayload.messages[0].userId
      await cancelConfession(userId, messageTableName, dynamoDb)
    } else {
      console.log('ignoring confession')
    }
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
