const log = require('loglevel');

const token = {};

function refreshToken() {
  if (!token.expiry) return true;
  const now = Date.now();
  return (now > token.expiry.getTime());
}

function setToken(obj) {
  Object.assign(token, obj);
  log.debug(`New Token: ${JSON.stringify(token)}`);
  log.info('Session token received');
}

module.exports = {
  refreshToken,
  setToken,
};
