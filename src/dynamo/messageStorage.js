const AWS = require('aws-sdk')

/**
 * Recupera as confissões de usuário.
 *
 * @param {string[]} userIds Ids dos usuários no twitter.
 * @param {string} tableName Nome da tabela de usuários no dynamo.
 * @param {AWS.DynamoDB.DocumentClient} client Cliente de acesso do dynamo.
 * @returns {Promise<PromiseResult<AWS.DynamoDB.DocumentClient.BatchGetItemOutput, AWS.AWSError>>}
 */
const retrieveConfessionDataForUsers = (userIds, tableName, client) => {
  const params = {
    RequestItems: {},
  }

  params.RequestItems[tableName] = {
    Keys: userIds.map((userId) => ({ id: { S: userId } })),
    ProjectionExpression: 'KEY_NAME, ATTRIBUTE',
  }

  return client.batchGet(params).promise()
}

/**
 * Verifica se um determinado usuário já tem mensagens esperando ser enviadas para não adicionar na fila.
 *
 * @param {string} userId The twitter user id.
 * @param {string} tableName The table where the user is.
 * @param {AWS.DynamoDB.DocumentClient} client The client for dynamodb.
 * @returns {Promise<PromiseResult<AWS.DynamoDB.DocumentClient.BatchGetItemOutput, AWS.AWSError>>}
 */
const alreadyInQueue = (userId, tableName, client) => {}

/**
 * Atualiza a tabela de um usuário para colocar um post realizado em uma
 *
 * @param {AWS.DynamoDB.DocumentClient.BatchGetItemOutput[]} usersData Ids dos usuários no twitter.
 * @param {string} tableName Nome da tabela de usuários no dynamo.
 * @param {AWS.DynamoDB.DocumentClient} client Cliente de acesso do dynamo.
 * @returns {Promise<PromiseResult<AWS.DynamoDB.DocumentClient.BatchGetItemOutput, AWS.AWSError>>}
 */
const markMessagesSent = (usersData, tableName, client) => {}

/**
 * Insere uma mensagem a uma lista de confissões do usuário.
 *
 * @param {string} message Insere uma mensagem em uma lista de confissões do usuário para fazer um único tweet com todas as confissões.
 * @param {number} timestamp Timestamp da mensagem.
 * @param {string} userId O id do usuário no twitter.
 * @param {string} tableName O nome da tablea que contém as informações do usuário.
 * @param {AWS.DynamoDB.DocumentClient} client O cliente de acesso ao dynamodb.
 * @returns {Promise<boolean>}
 */
const addMessageToConfession = async (
  message,
  timestpa,
  userId,
  tableName,
  client
) => {}

/**
 * Cancela a confissão realizada por um usuário.
 *
 * @param {string} userId O id do usuário no twitter.
 * @param {string} tableName O nome da tablea que contém as informações do usuário.
 * @param {AWS.DynamoDB.DocumentClient} client O cliente de acesso ao dynamodb.
 */
const cancelConfession = async (userId, tableName, client) => {}

module.exports = {
  retrieveConfessionDataForUsers,
  alreadyInQueue,
  markMessagesSent,
  addMessageToConfession,
  cancelConfession,
}
