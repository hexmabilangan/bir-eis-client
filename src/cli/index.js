const { Command } = require('commander');
const { version } = require('../../package.json');
const { configure } = require('../client');

const authorization = require('./authorize');
const sendInvoices = require('./sendInvoices');

const program = new Command();

if (require.main === module) {
  program
    .name('bir-eis-client')
    .description('Check connection with API')
    .version(version);

  program.option('--log [level]', 'set the log level: error, warn, info, debug, trace, silent', 'info');
  program.helpOption('-h, --help', 'get help');

  authorization(program);
  sendInvoices(program);

  program.parse();
  const options = program.opts();
  configure({ log: options.log });
}
