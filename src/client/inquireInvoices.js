const log = require('loglevel');
const axios = require('axios').default;
const fns = require('date-fns');
const { encryptHmac } = require('./auth');
const { getToken } = require('./session');
const { getResponse } = require('./helpers');

const { config } = require('./config');

async function inquireInvoices(params = {}) {
  const today = new Date();

  const {
    submitId,
    throwErrors,
  } = params;

  const urlPath = `/api/invoice_result/${submitId}`;
  const method = 'GET';

  const url = `${config.eisEndpointBaseUrl}${urlPath}`;

  const token = getToken();
  const datetime = fns.format(today, 'yyyyMMddHHmmss');
  const signature = encryptHmac({
    secret: token.sessionKey,
    value: `${datetime}${method.toUpperCase()}${urlPath}`,
  });

  const axiosParams = {
    method,
    url,
    headers: {
      accreditationId: config.accreditationId,
      applicationId: config.applicationId,
      authToken: token.authToken,
      authorization: `Bearer ${signature}`,
      datetime,
    },
  };

  log.debug(`Send Inquiry Request: ${JSON.stringify(axiosParams)}`);
  log.info('Sending Inquiry');

  let response;
  try {
    response = await axios(axiosParams);
  } catch (e) {
    response = e.response;
  }

  const output = getResponse({
    refId: submitId,
    response,
    throwErrors,
    isEncrypted: false,
  });

  log.debug(`Send Inquiry Response: ${JSON.stringify(output, null, 2)}`);
  if (!output.hasError) log.info('Send Inquiry Success');

  return output;
}

module.exports = {
  inquireInvoices,
};
