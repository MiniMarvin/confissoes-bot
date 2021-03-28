/**
 *
 * @param {{userId: string, timestamp: string}} messageData Informações da mensagem que o usuário enviou.
 * @param {string} queueUrl
 * @param {AWS.SQS} sqs
 */
module.exports.pushToQueue = (messageData, queueUrl, sqs) => {
  const params = {
    // Remove DelaySeconds parameter and value for FIFO queues
    MessageBody: JSON.stringify(messageData),
    QueueUrl: queueUrl,
  }

  return sqs.sendMessage(params).promise()
}

/**
 *
 * @param {string} queueUrl
 * @param {AWS.SQS} sqs
 */
module.exports.readQueue = async (queueUrl, sqs) => {
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
  }
  const message = await sqs.receiveMessage(params).promise()
  return message
}
