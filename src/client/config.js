const fs = require('fs');
const log = require('loglevel');

const configFile = 'config.json';
let config;

const defaults = {
  log: 'info',
  csvOptions: {},
};

function configure(cfg = {}) {
  const newCfg = {
    ...config,
    ...defaults,
    ...cfg,
    csvOptions: {
      ...config.csvOptions,
      ...defaults.csvOptions,
      ...(cfg.csvOptions || {}),
    },
  };
  Object.assign(config, newCfg);
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
