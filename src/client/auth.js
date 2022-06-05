const log = require('loglevel');
const forge = require('node-forge');
const fns = require('date-fns');
const axios = require('axios').default;
const jwt = require('jsonwebtoken');
const { config } = require('./config');
const { refreshToken } = require('./session');
const { getResponse } = require('./helpers');

let tmpSecretKey;

/**
 * Generate Auth Key Secret Key
 * @returns {String}
 */
function getTmpSecretKey() {
  if (tmpSecretKey) return tmpSecretKey;

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%^&*()';
  const targetLen = 32;
  tmpSecretKey = '';
  do {
    tmpSecretKey += chars.charAt(Math.floor(Math.random() * chars.length));
  } while (tmpSecretKey.length < targetLen);

  return tmpSecretKey;
}

/**
 * Convert public key to PEM
 * @param {String} publicKey
 */
function toPublicPem(publicKey) {
  const pem = ['-----BEGIN PUBLIC KEY-----'];
  const str = String(publicKey).split(/.{,64}/);
  pem.push(...str);
  pem.push('-----END PUBLIC KEY-----');
  return pem.join('\n');
}

/**
 * Convert private key to PEM
 * @param {String} publicKey
 */
function toPrivatePem(privateKey) {
  const pem = ['-----BEGIN PRIVATE KEY-----'];
  const str = String(privateKey).split(/.{,64}/);
  pem.push(...str);
  pem.push('-----END PRIVATE KEY-----');
  return pem.join('\n');
}

/**
 * Encrypt using RSA
 * @param {*} params
 * @returns {Object}
 */
function encryptRsa(params = {}) {
  const {
    data = {
      userId: config.userId,
      password: config.password,
      authKey: getTmpSecretKey(),
    },
    publicKey = config.eisPublicKey,
  } = params;

  const pem = toPublicPem(publicKey);
  const key = forge.pki.publicKeyFromPem(pem);
  const jsonStr = JSON.stringify(data);
  const encrypted = key.encrypt(jsonStr);
  const output = forge.util.encode64(encrypted);
  return { data: output };
}

/**
 * Encrypt using AES
 * @param {*} params
 * @returns {Object}
 */
function encryptAes(params = {}) {
  const {
    data,
    key = getTmpSecretKey(),
    algorithm = 'AES-CBC',
  } = params;

  if (typeof data !== 'string') throw new Error('Input data must be string');
  const iv = `${key}`.substring(0, 16);

  const cipher = forge.cipher.createCipher(algorithm, key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(data));
  cipher.finish();

  const output = Buffer.from(cipher.output.toHex(), 'hex').toString('base64');
  return { data: output };
}

/**
 * Decrypt using AES
 * @param {*} params
 * @returns {Object}
 */
function decryptAes(params = {}) {
  const {
    data,
    key = getTmpSecretKey(),
    algorithm = 'AES-CBC',
  } = params;

  const iv = `${key}`.substring(0, 16);
  const encBuffer = forge.util.createBuffer(
    Buffer.from(data, 'base64'),
    'raw',
  );

  const decipher = forge.cipher.createDecipher(algorithm, key);
  decipher.start({ iv });
  decipher.update(encBuffer);
  const result = decipher.finish();

  let output = null;
  if (result) {
    output = Buffer.from(decipher.output.toHex(), 'hex').toString('utf-8');
  }

  return { data: output };
}

/**
 * Create HMAC Signature
 */
function encryptHmac(params = {}) {
  const {
    secret = config.applicationSecretKey,
    value = '',
    algorithm = 'sha256',
    encoding = 'base64',
  } = params;
  // generate signature
  log.debug(`Generating HMAC signature from value: ${value}`);
  const hmac = forge.hmac.create();
  hmac.start(algorithm, secret);
  hmac.update(value);
  return Buffer.from(hmac.digest().toHex(), 'hex').toString(encoding);
}

function jwsSign(params = {}) {
  const {
    payload = '',
    secret = config.applicationPrivateKey,
    options = {
      algorithm: 'RS256',
      keyid: config.applicationKeyId,
    },
  } = params;

  return jwt.sign(
    payload,
    toPrivatePem(secret),
    options,
  );
}

/**
 * Auth request
 * @param {} params
 */
async function authorize(params = {}) {
  const urlPath = '/api/authentication';
  const method = 'POST';

  const url = `${config.eisEndpointBaseUrl}${urlPath}`;

  const {
    userId = config.userId,
    password = config.password,
    authKey = getTmpSecretKey(),
  } = params;

  const data = { userId, password, authKey };

  // generate signature
  const datetime = fns.format(new Date(), 'yyyyMMddHHmmss');
  const signature = encryptHmac({
    value: `${datetime}${method.toUpperCase()}${urlPath}`,
  });
  const encrypted = encryptRsa({ data });

  const axiosParams = {
    method,
    url,
    headers: {
      accreditationId: config.accreditationId,
      applicationId: config.applicationId,
      authorization: `Bearer ${signature}`,
      datetime,
    },
    data: {
      data: encrypted.data,
      forceRefreshToken: refreshToken(),
    },
  };

  log.debug(`Auth Request: ${JSON.stringify(axiosParams)}`);
  log.info('Requesting Authorization');

  let response;
  try {
    response = await axios(axiosParams);
  } catch (e) {
    response = e.response;
  }

  const output = getResponse({
    response,
    key: data.authKey,
    decryptFn: decryptAes,
  });

  log.debug(`Auth Response: ${JSON.stringify(output)}`);
  if (!output.hasError) log.info('Auth Success');

  return output;
}

module.exports = {
  getTmpSecretKey,
  encryptRsa,
  encryptAes,
  decryptAes,
  encryptHmac,
  jwsSign,
  authorize,
};
