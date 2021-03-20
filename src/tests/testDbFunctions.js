const AWS = require('aws-sdk')
const {
  addConfession,
  retrieveConfessionDataForUsers,
  finishConfession,
} = require('../dynamo/messageStorage')
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })

const userId = 'test123'
const tableName = 'indiretas-anonimas-dev'
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

const testInsertion = async () => {
  await addConfession(messages, userId, 123, tableName, dynamoDb)
}

const testGet = async () => {
  return await retrieveConfessionDataForUsers('test123', tableName, dynamoDb)
}

const testFinish = async () => {
  const data = await retrieveConfessionDataForUsers(
    'test123',
    tableName,
    dynamoDb
  )
  const finish = await finishConfession(data.Item, tableName, dynamoDb)
  console.log(finish)
  return finish
}

// TODO: transform in a real test with local database
const main = async () => {
  await testInsertion()

  const res = await testGet()
  console.log(JSON.stringify(res, null, 2))

  const finish = await testFinish()
  console.log(finish)
}

main()
