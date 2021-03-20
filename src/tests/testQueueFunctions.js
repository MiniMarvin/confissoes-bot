const AWS = require('aws-sdk')
const { pushToQueue } = require('../sqs/manageQueue')
const sqs = new AWS.SQS({ region: 'us-east-1', apiVersion: '2012-11-05' })

// TODO: transform in a real test with local database
const main = async () => {
  const userId = 'test123'
  const timestamp = new Date()
  const message = {
    userId: userId,
    timestamp: timestamp.toISOString(),
  }

  const res = await pushToQueue(
    message,
    'https://sqs.us-east-1.amazonaws.com/327787252685/indiretas-anonimas-dev',
    sqs
  )
  console.log(res)
}

main()
