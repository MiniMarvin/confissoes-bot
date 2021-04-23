const AWS = require('aws-sdk')

/**
 * Recupera as confissões de usuário.
 *
 * @param {string} userId Id do usuário no twitter.
 * @param {string} tableName Nome da tabela de usuários no dynamo.
 * @param {AWS.DynamoDB.DocumentClient} client Cliente de acesso do dynamo.
 * @returns {Promise<PromiseResult<AWS.DynamoDB.DocumentClient.BatchGetItemOutput, AWS.AWSError>>}
 */
const retrieveConfessionDataForUser = (userId, tableName, client) => {
  const params = {
    Key: {
      id: userId,
    },
    TableName: tableName,
  }

  return client.get(params).promise()
}

/**
 * Verifica se um determinado usuário já tem mensagens esperando ser enviadas para não adicionar na fila.
 *
 * @param {string} userId The twitter user id.
 * @param {string} tableName The table where the user is.
 * @param {AWS.DynamoDB.DocumentClient} client The client for dynamodb.
 * @returns {Promise<boolean>}
 */
const alreadyInQueue = async (userId, tableName, client) => {
  const documentExpression = {
    TableName: tableName,
    Key: { id: userId },
    ProjectionExpression: 'hasConfession, confessionTimestamp',
  }
  try {
    const response = await client.get(documentExpression).promise()
    console.log('ddb response: ', JSON.stringify(response))
    return response.Item?.hasConfession
  } catch (err) {
    console.trace(err)
    return false
  }
}

/**
 * Insere uma mensagem a uma lista de confissões do usuário.
 *
 * @param {{ userId: string, message: string, timestamp: number}[]} messages Lista de mensagens a ser inserido no objeto de confissões.
 * @param {string} userId O id do usuário no twitter.
 * @param {number} timestamp Timestamp da mensagem.
 * @param {string} tableName O nome da tablea que contém as informações do usuário.
 * @param {AWS.DynamoDB.DocumentClient} client O cliente de acesso ao dynamodb.
 * @returns {Promise<boolean>}
 */
const addMessagesToConfession = async (
  messages,
  userId,
  timestamp,
  tableName,
  client
) => {
  const messagesExpression = messages.map((message) => ({
    message: message.message,
    timestamp: message.timestamp,
  }))

  const updateMessageList = {
    TableName: tableName,
    Key: {
      id: userId,
    },
    UpdateExpression:
      'SET #messageList = list_append(if_not_exists(#messageList, :empty_list), :messages), #lastMessageTimestamp = :lastMessageTimestamp',
    ExpressionAttributeNames: {
      '#messageList': 'confessionMessages',
      '#lastMessageTimestamp': 'lastMessageTimestamp',
    },
    ExpressionAttributeValues: {
      ':messages': messagesExpression,
      ':empty_list': [],
      ':lastMessageTimestamp': timestamp,
    },
  }

  try {
    await client.update(updateMessageList).promise()
  } catch (err) {
    console.trace(err)
    return false
  }

  return true
}

/**
 * Insere uma mensagem a uma lista de confissões do usuário.
 *
 * @param {{ userId: string, message: string, timestamp: number}[]}} messages Lista de mensagens a ser inserido no objeto de confissões.
 * @param {number} timestamp Timestamp da mensagem.
 * @param {string} userId O id do usuário no twitter.
 * @param {string} tableName O nome da tablea que contém as informações do usuário.
 * @param {AWS.DynamoDB.DocumentClient} client O cliente de acesso ao dynamodb.
 * @returns {Promise<PromiseResult<AWS.DynamoDB.DocumentClient.UpdateItemOutput, AWS.AWSError>>}
 */
const addConfession = async (
  messages,
  userId,
  timestamp,
  tableName,
  client
) => {
  const updateMessageList = {
    TableName: tableName,
    Key: {
      id: userId,
    },
    UpdateExpression:
      'SET #timestamp = :timestamp, #hasConfession = :hasConfession',
    ExpressionAttributeNames: {
      '#timestamp': 'confessionTimestamp',
      '#hasConfession': 'hasConfession',
    },
    ExpressionAttributeValues: {
      ':timestamp': timestamp,
      ':hasConfession': true,
    },
  }

  try {
    const setupPromise = client.update(updateMessageList).promise()
    const setupResponse = await setupPromise

    const messagesPromise = addMessagesToConfession(
      messages,
      userId,
      timestamp,
      tableName,
      client
    )
    const messagesResponse = await messagesPromise

    console.log(
      JSON.stringify({ setup: setupResponse, messages: messagesResponse })
    )
  } catch (err) {
    console.trace(err)
    return false
  }

  return true
}

/**
 * Atualiza a tabela de um usuário para colocar um post realizado em uma
 *
 * @param {any} confessionaData Objeto contendo os dados do usuário
 * @param {string} tableName Nome da tabela de usuários no dynamo.
 * @param {AWS.DynamoDB.DocumentClient} client Cliente de acesso do dynamo.
 * @returns {Promise<boolean>}
 */
const finishConfession = (confessionData, tableName, client) => {
  if (
    !confessionData.confessionMessages ||
    confessionData.confessionMessages.length === 0
  )
    return false
  const timestamp = new Date().getTime()
  const params = {
    TableName: tableName,
    Key: {
      id: confessionData.id,
    },
    UpdateExpression:
      'SET #previousConfessions = list_append(if_not_exists(#previousConfessions, :empty_list), :confessionData), #messageList = :empty_list, #hasConfession = :hasConfession, #timestamp = :timestamp',
    ExpressionAttributeNames: {
      '#previousConfessions': 'previousConfessions',
      '#messageList': 'confessionMessages',
      '#timestamp': 'confessionTimestamp',
      '#hasConfession': 'hasConfession',
    },
    ExpressionAttributeValues: {
      ':confessionData': [
        {
          finishTimestamp: timestamp,
          confession: confessionData.confessionMessages,
        },
      ],
      ':empty_list': [],
      ':timestamp': -1,
      ':hasConfession': false,
    },
  }

  return client.update(params).promise()
}

/**
 * Cancela a confissão realizada por um usuário.
 *
 * @param {string} userId O id do usuário no twitter.
 * @param {string} tableName O nome da tablea que contém as informações do usuário.
 * @param {AWS.DynamoDB.DocumentClient} client O cliente de acesso ao dynamodb.
 * @returns {Promise<boolean>}
 */
const cancelConfession = async (userId, tableName, client) => {
  // TODO: fazer assign do #messageList para o #canceledConfessions
  // Desabilita todas as flags que indicam que o documento tem uma confissão em andamento
  // e o identificador de timestamp para o andamento daquela confissão através de uma
  // fila do SQS.

  const confessionData = await retrieveConfessionDataForUser(
    userId,
    tableName,
    client
  )
  const timestamp = new Date().getTime()
  canceledConfession = [
    {
      cancelTimestamp: timestamp,
      confession: confessionData?.Item?.confessionMessages || [],
    },
  ]

  const updateMessageList = {
    TableName: tableName,
    Key: {
      id: userId,
    },
    UpdateExpression:
      'SET #messageList = :empty_list, #canceledConfessions = list_append(if_not_exists(#canceledConfessions, :empty_list), :vals), #hasConfession = :hasConfession, #timestamp = :timestamp',
    ExpressionAttributeNames: {
      '#messageList': 'confessionMessages',
      '#canceledConfessions': 'canceledConfessions',
      '#hasConfession': 'hasConfession',
      '#timestamp': 'confessionTimestamp',
    },
    ExpressionAttributeValues: {
      ':vals': canceledConfession,
      ':empty_list': [],
      ':hasConfession': false,
      ':timestamp': -1,
    },
  }

  try {
    await client.update(updateMessageList).promise()
  } catch (err) {
    console.trace(err)
    return false
  }

  return true
}

module.exports = {
  retrieveConfessionDataForUser,
  alreadyInQueue,
  finishConfession,
  addMessagesToConfession,
  addConfession,
  cancelConfession,
}
