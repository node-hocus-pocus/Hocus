# Hocus
A command line tool to publish a Node.js Express app to the AWS API Gateway.

## Commands
### configure
Create profiles to use when Hocus deploys your app.  Stores in a file in `<userhome>/.hocus/credentials.json`.  
Run  
`hocus configure`

Then, enter a profile name (defaults to `dev`), AWS Access Key, AWS Secret Access Key, and region name (default is `us-east-1`).

## Testing
Run
`npm test`.