const request = require('supertest');
const crearApp = require('../src/app');
const userStore = require('../src/models/userStore');
const { generarToken } = require('../src/utils/jwt');
const { hashPassword } = require('../src/utils/password');

const app = crearApp();

describe('Acceso de administrador', () => {
  beforeEach(() => {
    userStore.reset();
  });

  it('permite a un administrador listar las personas donantes', async () => {
    const passwordHash = await hashPassword('adminpass123');
    const admin = userStore.create({
      nombre: 'Admin HelpCare',
      email: 'admin@helpcare.org',
      passwordHash,
      rol: 'administrador',
    });
    const token = generarToken(admin);

    await request(app).post('/api/auth/registro').send({
      nombre: 'Donante Uno',
      email: 'donante1@example.com',
      password: '12345678',
    });

    const res = await request(app)
      .get('/api/donantes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('un administrador autenticado sí puede crear otro administrador', async () => {
    const passwordHash = await hashPassword('adminpass123');
    const admin = userStore.create({
      nombre: 'Admin HelpCare',
      email: 'admin@helpcare.org',
      passwordHash,
      rol: 'administrador',
    });
    const token = generarToken(admin);

    const res = await request(app)
      .post('/api/auth/registro')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Nuevo Admin',
        email: 'admin2@helpcare.org',
        password: '12345678',
        rol: 'administrador',
      });

    expect(res.status).toBe(201);
    expect(res.body.usuario.rol).toBe('administrador');
  });

  it('devuelve 404 si el usuario del token ya no existe', async () => {
    const fakeUser = { id: 9999, email: 'x@x.com', rol: 'donante' };
    const token = generarToken(fakeUser);
    const res = await request(app)
      .get('/api/donantes/perfil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
