
var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB();

/*

PRE-REQUISITES:
- Become familiar with AWS Lambda function aliases and versions: http://docs.aws.amazon.com/lambda/latest/dg/aliases-intro.html
- Create one or more aliases for your Lambda function (i.e. DEV, TEST, PROD)
- Create a DynamoDB table and create one item per stage, each one with a different key. Make sure each key also has the stage name in it(i.e. mykey_DEV, mykey_TEST, mykey_PROD)

Each item in the DynamoDB table must have the config values your function will need, for example:
  myConfigTable.s3bucket = mydevbucket
  myConfigTable.snstopic = mydevtopic


This function loads config values from a Dynamo DB table (i.e. 'lambda-config').
It fetches a config item based on the Lambda function alias you are executing. For example, 
if you are running the function's "DEV" alias, the function will fetch a config item stored
in the "/DEV" folder of your config table.

The function knows which configuration to grab based on the function alias we are running, 
which is available in the invoked function ARN. For example, in function ARN 
arn:aws:lambda:us-east-1:123456789012:function:helloStagedWorld:DEV,  "DEV" indicates the
function alias we are running. 

This way your main function code doesn't need to know which stage is running in (DEV, TEST, etc.)

*/

/*
This function assumes the format of the config item in DDB is configKeyPrefixSTAGE. For example: fileprocessingapp_DEV

*/

function loadConfig(ddbtable, configkeyPrefix, context, callback){

	functionName = context.functionName
	functionArn = context.invokedFunctionArn
	alias = functionArn.split(":").pop()

	//the ARN doesn't include an alias token, therefore we must be executing $LATEST
	if (alias == functionName)
		alias = "$LATEST"

	obj_key = configkeyPrefix + alias
	console.log('DDB key:['+obj_key+']')

    var params = {
        	Key:{
          		stage:{
          			S: obj_key	
          		} 
        	},
        	TableName:ddbtable,
        	AttributesToGet: ['s3bucket','snstopic']
        }

    ddb.getItem(params, function(err, data) {
        if (err) {
            console.log(err);
            var message = "Error getting object from DynamoDB"
            console.log(message)
            context.fail(message)
        } else {
			callback(data)
        }
    });	
}


exports.handler = function(event, context) {
	var configTable = "lambda-config"
	var configKeyPrefix = "mykey_"
	loadConfig(configTable, configKeyPrefix, context, function(env_config){
		console.log('My S3 bucket:', env_config.Item.s3bucket.S)
		console.log('My SNS topic:', env_config.Item.snstopic.S)
		//do something with config values...
    	context.succeed(env_config)
    	});
};
