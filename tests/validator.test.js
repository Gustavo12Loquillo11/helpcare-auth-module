const { validarRegistro } = require('../src/validators/donanteValidator');

describe('validarRegistro', () => {
  it('no devuelve errores con datos válidos', () => {
    const errores = validarRegistro({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: '12345678',
    });
    expect(errores).toHaveLength(0);
  });

  it('detecta nombre inválido', () => {
    const errores = validarRegistro({ nombre: 'A', email: 'ana@example.com', password: '12345678' });
    expect(errores.some((e) => e.includes('nombre'))).toBe(true);
  });

  it('detecta correo inválido', () => {
    const errores = validarRegistro({ nombre: 'Ana', email: 'correo-invalido', password: '12345678' });
    expect(errores.some((e) => e.includes('correo'))).toBe(true);
  });

  it('detecta contraseña corta', () => {
    const errores = validarRegistro({ nombre: 'Ana', email: 'ana@example.com', password: '123' });
    expect(errores.some((e) => e.includes('contraseña'))).toBe(true);
  });

  it('detecta múltiples campos faltantes', () => {
    const errores = validarRegistro({});
    expect(errores.length).toBe(3);
  });
});
