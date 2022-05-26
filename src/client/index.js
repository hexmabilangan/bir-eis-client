const { configure } = require('./config');
const { authorize } = require('./auth');
const { sendInvoices } = require('./sendInvoices');

module.exports = {
  authorize,
  configure,
  sendInvoices,
};
