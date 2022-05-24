const { authorize } = require('../client/auth');

describe('api', () => {
  it('authorize', async () => {
    expect.assertions(2);
    const result = await authorize();
    expect(result.apiStatusCode).toBe(200);
    expect(result.hasError).toBe(false);
  });
});
