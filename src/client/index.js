const { configure } = require('./config');
const { authorize } = require('./auth');
const { sendInvoices } = require('./sendInvoices');
const { inquireInvoices } = require('./inquireInvoices');

module.exports = {
  authorize,
  configure,
  sendInvoices,
  inquireInvoices,
};
