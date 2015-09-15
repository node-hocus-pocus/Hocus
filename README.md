# Hocus
A command line tool to publish a Node.js Express app to the AWS API Gateway.

## Commands
### configure
`hocus configure`  
Create your AWS credentials in profiles to use when Hocus deploys your app.  Stores in a file in `<userhome>/.hocus/credentials.json`.  

### init
`hocus init`  
Initialize Hocus for your Express application.  Run this in the same directory where your `package.json` is located.  Creates a `.hocus` file that will be used to store information about how to deploy your app.

## Testing
Run
`npm test`.