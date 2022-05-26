const log = require('loglevel');
const axios = require('axios').default;
const fns = require('date-fns');
const { config } = require('./config');
const { encryptHmac, encryptAes, decryptAes, jwsSign } = require('./auth');
const { getToken } = require('./session');
const { getResponse } = require('./helpers');
const { casIssuedInvoice, crmPosIssuedInvoice } = require('../model/eInvoice');

/**
 * Generate Submit Id
 * @returns {String}
 */
function genSubmitId(params = {}) {
  const { date = new Date() } = params;
  const chars = '0123456789abcdef';
  const targetLen = 12;
  let random = '';
  do {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  } while (random.length < targetLen);

  const yyyyMMdd = fns.format(date, 'yyyyMMdd');
  return `${config.accreditationId}-${yyyyMMdd}-${random}`;
}

/**
 * Send Invoices
 */
async function sendInvoices(params = {}) {
  const today = new Date();

  const urlPath = '/api/invoices';
  const method = 'POST';
  const {
    source, // must be cas, crm, pos
    data = [],
    submitId = genSubmitId({ date: today }),
  } = params;

  const url = `${config.eisEndpointBaseUrl}${urlPath}`;

  const token = getToken();
  const datetime = fns.format(today, 'yyyyMMddHHmmss');
  const signature = encryptHmac({
    secret: token.sessionKey,
    value: `${datetime}${method.toUpperCase()}${urlPath}`,
  });

  if (!String(source).match(/(CAS|CRM|POS)/)) {
    throw new Error(`Invalid source '${source}'. Must be CAS, CRM, or POS`);
  }
  const model = source === 'CAS' ? casIssuedInvoice : crmPosIssuedInvoice;

  // process data
  const signedInv = data.map((inv) => {
    const validated = model().validateSync(inv, { abortEarly: false });
    return jwsSign({
      payload: JSON.stringify(validated),
      secret: config.applicationPrivateKey,
    });
  });
  const encrypted = encryptAes({
    data: signedInv.join(','),
    key: token.sessionKey,
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
    data: {
      submitId,
      data: encrypted.data,
    },
  };

  log.debug(`Send Invoices Request: ${JSON.stringify(axiosParams)}`);
  log.info('Sending Invoices');

  let response;
  try {
    response = await axios(axiosParams);
  } catch (e) {
    response = e.response;
  }

  const output = getResponse({
    response,
    key: token.sessionKey,
    decryptFn: decryptAes,
  });

  log.debug(`Send Invoice Response: ${JSON.stringify(output)}`);
  if (!output.hasError) log.info('Send Invoices Success');

  return output;
}

module.exports = {
  sendInvoices,
};
