/**
 *
 * @param {{userId: string, timestamp: string}} messageData Informações da mensagem que o usuário enviou.
 * @param {AWS.SQS} queue
 */
const pushToQueue = (messageData, queue) => {}

module.exports = {
  pushToQueue,
}
