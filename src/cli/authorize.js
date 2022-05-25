const { authorize } = require('../client');

function authCmd(cli) {
  cli.command('authorize')
    .description('Call the authorization API')
    .action(async () => authorize());
}

module.exports = authCmd;
