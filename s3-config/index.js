
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

/*

PRE-REQUISITES:
- Become familiar with AWS Lambda function aliases and versions: http://docs.aws.amazon.com/lambda/latest/dg/aliases-intro.html
- Create one or more aliases for your Lambda function (i.e. DEV, TEST, PROD)
- Create an S3 bucket and create one folder per stage (i.e. mybucket/DEV, mybucket/TEST, mybucket/PROD)
- Create one config file in each folder (i.e. env-config.json) and create relevant entries.
  
For example:
  {
    "s3bucket": "mydevbucket",
    "snstopic": "mydevtopic"
  }

This function loads config values from a JSON file (env-config.json) stored in S3.
It fetches a config file based on the Lambda function alias you are executing. For example, 
if you are running the function's "DEV" alias, the function will fetch config file stored
in the "/DEV" folder of your config bucket.

The function knows which configuration to grab based on the function alias we are running, 
which is available in the invoked function ARN. For example, in function ARN 
arn:aws:lambda:us-east-1:123456789012:function:helloStagedWorld:DEV,  "DEV" indicates the
function alias we are running. 

*/


function loadConfig(s3bucket, configFile, context, callback){

	functionName = context.functionName
	functionArn = context.invokedFunctionArn
	alias = functionArn.split(":").pop()

	//the ARN doesn't include an alias token, therefore we must be executing $LATEST
	if (alias == functionName)
		alias = "$LATEST"

	obj_key = alias + "/" + configFile
	console.log('S3 object key:['+obj_key+']')

    var params = {
        Bucket: s3bucket,
        Key: obj_key
        }

    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err);
            var message = "Error getting object from S3"
            console.log(message)
            context.fail(message)
        } else {
			env_config = JSON.parse(String(data.Body))
			callback(env_config)
        }
    });	
}


exports.handler = function(event, context) {
	var configBucket = "hello-staged-world-config"
	var configFile = "env-config.json"
	loadConfig(configBucket, configFile, context, function(env_config){
		console.log('My S3 bucket:', env_config.s3bucket)
		console.log('My SNS topic:', env_config.snstopic)
		//do something with config values...
    	context.succeed(env_config)
    	});
};



