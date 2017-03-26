

Lambda environment config
=========================

This repo has examples for configuring AWS Lambda functions. The examples use Lambda function
versions and aliases to determine which config values to fetch (i.e. DEV, TEST, PROD).

More details in the following post:

https://www.concurrencylabs.com/blog/configure-your-lambda-function-like-a-champ-sail-smoothly/


### Lambda Environment Variables

In this example, the Lambda function gets config values from Lambda Environment Variables that
are configured for the function itself. It gets the right value based on the current
stage (DEV, TEST, PROD)

### Store configuration files in S3 (s3-config folder)
In this example, the Lambda function fetches config files from an S3 bucket defined
in index.js. This bucket has one folder per stage (i.e. $LATEST, DEV, TEST, PROD) and
each folder contains a config file.


### Store configuration items in Dynamo DB (dynamo-db-config folder)
In this example, the Lambda function fetches config values from a DynamoDB table. Each item
in the table stores a set of config values. The key for each item consists of a prefix and 
the actual stage. For example: mykey_$LATEST, mykey_DEV, etc.


### Include configuration files with the function package (package-config folder)
In this example, the Lambda function reads config values from a file that is packaged together
with the function.










