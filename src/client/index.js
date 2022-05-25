const { configure } = require('./config');
const { authorize } = require('./auth');

module.exports = {
  authorize,
  configure,
};
