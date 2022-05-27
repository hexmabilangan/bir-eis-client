const {
  configure,
  authorize,
  sendInvoices,
} = require('../client');

const casSample1 = require('./samples/cas_sample1.json');
const posSample1 = require('./samples/pos_sample1.json');

describe('send invoices', () => {
  async function beforeAll() {
    configure({ log: 'silent' }); // <-- update during manual testing
    await authorize();
  }

  it('send cas invoice 1', async () => {
    expect.assertions(1);
    await beforeAll();
    const output = await sendInvoices({
      source: 'CAS',
      data: [casSample1, casSample1],
    });
    expect(output.apiStatusCode).toBe(200);
  });

  it('send pos invoice 1', async () => {
    expect.assertions(1);
    await beforeAll();
    const output = await sendInvoices({
      source: 'POS',
      data: [posSample1, posSample1],
    });
    expect(output.apiStatusCode).toBe(200);
  });
});
