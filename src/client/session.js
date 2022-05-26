const log = require('loglevel');

const token = {
  accreditationId: null,
  userId: null,
  authToken: null,
  sessionKey: null,
  tokenExpiry: null,
};

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

function getToken() {
  return { ...token };
}

module.exports = {
  refreshToken,
  setToken,
  getToken,
};
