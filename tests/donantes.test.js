const request = require('supertest');
const crearApp = require('../src/app');
const userStore = require('../src/models/userStore');

const app = crearApp();

async function registrarYObtenerToken(datos) {
  const res = await request(app).post('/api/auth/registro').send(datos);
  return res.body.token;
}

describe('Rutas protegidas de donantes', () => {
  beforeEach(() => {
    userStore.reset();
  });

  it('rechaza el acceso al perfil sin token', async () => {
    const res = await request(app).get('/api/donantes/perfil');
    expect(res.status).toBe(401);
  });

  it('rechaza el acceso con header Authorization mal formado', async () => {
    const res = await request(app)
      .get('/api/donantes/perfil')
      .set('Authorization', 'TokenSinBearer');
    expect(res.status).toBe(401);
  });

  it('rechaza el acceso con token inválido', async () => {
    const res = await request(app)
      .get('/api/donantes/perfil')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.status).toBe(401);
  });

  it('permite a un usuario autenticado ver su propio perfil', async () => {
    const token = await registrarYObtenerToken({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: '12345678',
    });
    const res = await request(app)
      .get('/api/donantes/perfil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('ana@example.com');
  });

  it('impide que una persona donante liste a todos los usuarios', async () => {
    const token = await registrarYObtenerToken({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: '12345678',
    });
    const res = await request(app)
      .get('/api/donantes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
