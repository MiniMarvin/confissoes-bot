'use strict';

const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();

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
  };
  
  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.createPost = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const text = requestBody.text;
  
  if (!text) {
    return {
      statusCode: 400,
      body:JSON.stringify({
        message: 'text message must not be null',
        input: event
      })
    }
  }
  
  const date = (new Date()).toISOString();
  const tableData = {
    TableName: process.env.MESSAGES_TABLE,
    Item: {
      date: date,
      text: text
    },
  };
  
  try {
    await dynamoDb.put(tableData).promise();
  } catch(err) {
    console.trace(err);
    return {
      statusCode: 500,
      body:JSON.stringify({
        message: err,
        input: event
      })
    }
  }
  
  return {
    statusCode: 200,
    body:JSON.stringify({
      message: 'message inserted',
      input: event
    })
  }
}

module.exports.listPostsForUser = async (event, context, callback) => {
  
}

module.exports.telegramHandler = async (event, context, callback) => {
  
}