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
    key,
    decryptFn,
  } = params;
  const { data = {} } = response;

  const output = {
    apiStatusCode: response.status,
    apiStatusText: response.statusText,
    status: data.status,
    encryptedData: data.data,
    decryptedData: null,
    data: null,
    errorDetails: data.errorDetails || null,
    hasError: Boolean(data.errorDetails || response.status !== 200),
  };

  if (data.data) {
    const decrypted = decryptFn({
      key,
      data: data.data,
    });
    output.decryptedData = decrypted.data;
  }

  try {
    output.data = JSON.parse(output.decryptedData);
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
    const error = new Error(output.errorDetails
      ? output.errorDetails.errorMessage
      : output.apiStatusText);
    error.code = output.errorDetails
      ? output.errorDetails.errorCode
      : output.apiStatusCode;
    log.error(output);
    throw error;
  }

  return output;
}

module.exports = {
  getResponse,
};
