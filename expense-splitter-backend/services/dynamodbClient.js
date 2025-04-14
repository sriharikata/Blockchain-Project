const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1', // replace with your region
    // Optional: credentials if not using IAM roles
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDB;
