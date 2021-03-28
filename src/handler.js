'use strict'

const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const { crcChallenge } = require('./auth')
const {
  alreadyInQueue,
  addMessagesToConfession,
  addConfession,
  retrieveConfessionDataForUser,
  finishConfession,
  cancelConfession,
} = require('./dynamo/messageStorage')
const { selectAction } = require('./processMessages')
const { pushToQueue } = require('./sqs/manageQueue')
const { renderConfession } = require('./renderImage')
const { fs } = require('memfs')
const { postMedia } = require('./twitterManager')
const { getRandomPhrase } = require('./twitterManager/phrases')

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

const messageTableName = process.env.MESSAGES_TABLE
console.log('messages table: ', messageTableName)

module.exports.twitterHandler = async (event, context, callback) => {
  // Logs the event just to verify latter
  console.log(JSON.stringify(event))
  const request = JSON.parse(event.body)

  // validate if the event is DM message event, otherwise ignore.
  if (request.direct_message_events?.length > 0) {
    // TODO: melhorar o processamento de texto
    // Obs: Da forma que está implementado pode ocorrer um problema caso venham multiplos ids em uma única chamada
    console.log('selecting action')
    // TODO: validate if the userId is from the page, if so ignore and return imediately.
    const actionPayload = selectAction(request)
    console.log(JSON.stringify(actionPayload))
    const userId = actionPayload.messages[0].userId

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

        const queueUrl = process.env.CONFESSIONS_QUEUE_URL
        console.log(`pushing to queue with url: ${queueUrl}...`)
        pushToQueue(
          {
            userId: userId,
            timestamp: timestamp,
          },
          queueUrl,
          sqs
        )
          .then((res) => {
            console.log('message insert in queue:', JSON.stringify(res))
          })
          .catch((err) => {
            console.trace(err)
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
  }

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

module.exports.processConfession = async (event, context, callback) => {
  console.log(JSON.stringify(event))

  // TODO: get the message from the database, clean it and post the confession in the feed from twitter
  // TODO: improve the Post from the confession by making an image with the chat baloons
  /**
   * @type {{userId: string, timestamp: number}}
   */
  const messageData = JSON.parse(event.Records[0].body)
  const userDataPack = await retrieveConfessionDataForUser(
    messageData.userId,
    messageTableName,
    dynamoDb
  )
  const userData = userDataPack.Item
  console.log(JSON.stringify(userData))

  // match the timestamp
  if (
    userData.hasConfession &&
    userData.confessionTimestamp == messageData.timestamp
  ) {
    const messages = userData.confessionMessages.map(
      (payload) => payload.message
    )

    const filePath = '/out.png'
    try {
      console.log('vai tentar gerar a imagem')
      await renderConfession(messages, filePath, fs)

      // Recuperar os arrobas do twitter
      const names = messages
        .map((message) => message.match(/@(\w){1,15}/g))
        .reduce((prev, curr) => [...(prev || []), ...(curr || [])], [])

      const phrase = getRandomPhrase()
      const postMessage = phrase + '\n\n' + names.join(' ')

      // TODO: criar uma lista de frases interessantes para utilizar como legenda
      await postMedia(postMessage, filePath, fs)
      console.log('confession posted')
    } catch (err) {
      console.trace(err)
    }

    // TODO: Colocar no começo para que a pessoa possa postar outra confissão mais para frente caso ocorra algum erro, ou salvar em alguma coleção com o nome de erro...
    console.log('vai fechar o registro no banco de dados')
    console.log('confession data:', JSON.stringify(userData.confessionMessages))
    await finishConfession(userData, messageTableName, dynamoDb)
  }
  return {}
}
