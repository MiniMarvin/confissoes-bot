'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.status = async (event) => {
  return {
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
    TableName: process.env.CANDIDATE_TABLE,
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
        id: uuid.v1(),
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

module.exports.listPostsForUser = async (event) => {
  
}

module.exports.telegramHandler = async (event) => {
  
}