const AWS = require('aws-sdk')
const { addConfession } = require('../dynamo/messageStorage')
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })

// TODO: transform in a real test with local database
const main = async () => {
  const userId = 'test123'
  const messages = [
    {
      userId: userId,
      timestamp: 123,
      message: 'teste 123',
    },
    {
      userId: userId,
      timestamp: 456,
      message: 'teste 456',
    },
  ]

  await addConfession(messages, userId, 123, 'indiretas-anonimas-dev', dynamoDb)
}

main()
