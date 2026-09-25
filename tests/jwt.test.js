const { generarToken, verificarToken } = require('../src/utils/jwt');

describe('utils/jwt', () => {
  it('genera y verifica un token válido', () => {
    const usuario = { id: 1, email: 'ana@example.com', rol: 'donante' };
    const token = generarToken(usuario);
    const payload = verificarToken(token);
    expect(payload.sub).toBe(1);
    expect(payload.rol).toBe('donante');
  });

  it('lanza un error al verificar un token inválido', () => {
    expect(() => verificarToken('token.falso.aqui')).toThrow();
  });
});
