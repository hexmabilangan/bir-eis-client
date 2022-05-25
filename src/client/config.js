const fs = require('fs');
const log = require('loglevel');

const configFile = 'config.json';
let config;

const defaults = {
  log: 'info',
};

function configure(cfg = {}) {
  Object.assign(config, defaults, cfg);
  log.setLevel(config.log);
}

// check if there is an existing configuration
if (!config && fs.existsSync(configFile)) {
  config = {};
  log.info('Loading configuration');
  const str = fs.readFileSync(configFile);
  const cfg = JSON.parse(str);
  configure(cfg);
}

module.exports = {
  config,
  configure,
};
