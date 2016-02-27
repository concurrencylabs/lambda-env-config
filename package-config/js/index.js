

/*

PRE-REQUISITES:
- Become familiar with AWS Lambda function aliases and versions: http://docs.aws.amazon.com/lambda/latest/dg/aliases-intro.html
- Create one or more aliases for your Lambda function (i.e. DEV, TEST, PROD)
- Create a config file (./config/env-config.json) and configure entries for the Lambda function alias(es) you have created.

For example:
{
	"$LATEST":{
  			"s3bucket": "mylatestbucket",
  			"snstopic": "mylatesttopic"
  	},
	"DEV":{
  			"s3bucket": "mydevbucket",
  			"snstopic": "mydevtopic"
  	},
	"TEST":{
  			"s3bucket": "mytestbucket",
  			"snstopic": "myteststagetopic"
	},
	"PROD":{
  			"s3bucket": "myprodbucket",
  			"snstopic": "myprodtopic"
}    

This function loads config values from a JSON file './config/env-config.json'
It returns a config object based on the Lambda function alias you are executing. For example, 
if you are running the function's "DEV" alias, the function will return a config object for "DEV".

The function knows which configuration to grab based on the function alias we are running, 
which is available in the invoked function ARN. For example, in function ARN 
arn:aws:lambda:us-east-1:123456789012:function:helloStagedWorld:DEV,  "DEV" indicates the
function alias we are running. 

*/

var fs = require('fs');

function loadConfig(context, configFile, callback){
	fs.readFile('./config/'+configFile, function (err, data) {
  		if (err) {
    		console.log(err)
    		throw err
  		}
  		env_config = JSON.parse(data.toString())
		functionName = context.functionName
		functionArn = context.invokedFunctionArn
		alias = functionArn.split(":").pop()
		if (alias == functionName)
			alias = "$LATEST"

		callback(env_config[alias])
	});	
}

exports.handler = function(event, context) {
	var configFile = 'env-config.json'
	loadConfig(context, configFile, function(env_config){
		console.log('My S3 bucket:', env_config.s3bucket)
		console.log('My SNS topic:', env_config.snstopic)
    	//do something with config values...
    	context.succeed(env_config);
	});


};
