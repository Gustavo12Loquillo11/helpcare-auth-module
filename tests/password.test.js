const { hashPassword, comparePassword } = require('../src/utils/password');

describe('utils/password', () => {
  it('genera un hash distinto a la contraseña original', async () => {
    const hash = await hashPassword('12345678');
    expect(hash).not.toBe('12345678');
  });

  it('valida correctamente una contraseña correcta e incorrecta', async () => {
    const hash = await hashPassword('12345678');
    expect(await comparePassword('12345678', hash)).toBe(true);
    expect(await comparePassword('otra', hash)).toBe(false);
  });
});
