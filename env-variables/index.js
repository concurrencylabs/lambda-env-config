
/*
PRE-REQUISITES:
- Become familiar with AWS Lambda function aliases and versions: http://docs.aws.amazon.com/lambda/latest/dg/aliases-intro.html
- Create one or more aliases for your Lambda function (i.e. DEV, TEST, PROD)
- Configure Environment Variables for this function, using the AWS Management Console, CLI or SDK.
Environment Variables must have the following format:

  variable_name_{STAGE} = value

  For example:
  s3bucket_DEV  = mydevbucket
  s3bucket_TEST = mytestbucket


This function reads config values from the pre-configured Environment Variables for the function.
It knows which variable to fetch based on the function alias. For example, if you are running 
the function's "DEV" alias, the function will find the config for "DEV".

The function knows which configuration to grab based on the invoked function ARN.
For example, in function ARN 
arn:aws:lambda:us-east-1:123456789012:function:helloStagedWorld:DEV, 
"DEV" indicates the function alias we are running. 
*/

var fs = require('fs');

function loadConfig(context, callback){

	functionName = context.functionName
	functionArn = context.invokedFunctionArn
	alias = functionArn.split(":").pop()

	//the ARN doesn't include an alias token, therefore we must be executing $LATEST
	if (alias == functionName)
		alias = "LATEST"

	env_config = {}
	env_config.s3bucket = process.env['s3bucket_'+alias]
	env_config.snstopic = process.env['snstopic_'+alias]
	callback(env_config)
}

exports.handler = function(event, context) {
	loadConfig(context, function(env_config){
		console.log('My S3 bucket:', env_config.s3bucket)
		console.log('My SNS topic:', env_config.snstopic)
    	//do something with config values...
    	context.succeed(env_config);
	});


};
