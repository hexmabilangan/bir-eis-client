const log = require('loglevel');
const fnstz = require('date-fns-tz');
const { setToken } = require('./session');

const timeZone = 'Asia/Manila';

/**
 * Extract Response
 * @param {*} params
 * @returns
 */
function getResponse(params = {}) {
  const {
    response = {},
    refId, // any reference id
    key,
    decryptFn,
    isEncrypted = true,
    throwErrors = true,
  } = params;
  const { data = {} } = response;

  const output = {
    refId,
    apiStatusCode: response.status,
    apiStatusText: response.statusText,
    status: data.status,
    encryptedData: isEncrypted ? data.data : null,
    decryptedData: null,
    data: null,
    errorMessage: (data.errorDetails || {}).errorMessage || null,
    errorCode: (data.errorDetails || {}).errorCode || null,
    hasError: Boolean(data.errorDetails || response.status !== 200),
  };

  if (isEncrypted && data.data) {
    const decrypted = decryptFn({
      key,
      data: data.data,
    });
    output.decryptedData = decrypted.data;
  }

  try {
    if (isEncrypted) output.data = JSON.parse(output.decryptedData);
    else output.data = data.data;
  } catch (e) {
    // do nothing
  }

  // Check for token
  if (output.data && output.data.authToken) {
    const parsedDate = fnstz.toDate(output.data.tokenExpiry, { timeZone });
    const expiry = fnstz.utcToZonedTime(parsedDate, timeZone);

    setToken({
      authToken: output.data.authToken,
      sessionKey: output.data.sessionKey,
      tokenExpiry: expiry,
    });
    delete output.data.authToken;
    delete output.data.sessionKey;
    delete output.data.tokenExpiry;
  }

  if (output.hasError) {
    const error = new Error(output.apiStatusText || output.errorMessage);
    error.code = output.errorCode || output.apiStatusCode;
    log.error(output);
    if (throwErrors) throw error;
  }

  return output;
}

module.exports = {
  getResponse,
};
