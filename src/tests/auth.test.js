const auth = require('../client/auth');

describe('auth', () => {
  let encryptedAes;

  it('get auth key', () => {
    expect.assertions(2);
    const str = auth.getTmpSecretKey();
    expect(typeof str).toBe('string');
    expect(str).toHaveLength(32);
  });

  it('encrypt rsa', () => {
    expect.assertions(2);
    const data = {
      userId: 'douzone',
      password: 'abc!123',
      authKey: 'eQNWGyPMNyEzTlYBs9Vy#Z7rJub13r^6',
    };
    const output = auth.encryptRsa({ data });
    expect(typeof output.data).toBe('string');
    expect(output.data).not.toBeNull();
  });

  it('encrypt aes', () => {
    expect.assertions(1);
    const data = JSON.stringify({ foo: 'bar' });
    const output = auth.encryptAes({ data });
    encryptedAes = output.data;
    expect(encryptedAes).not.toBeNull();
  });

  it('decrypt aes', () => {
    expect.assertions(1);
    const output = auth.decryptAes({ data: encryptedAes });
    const json = JSON.parse(output.data);
    expect(json).toStrictEqual({ foo: 'bar' });
  });
});
