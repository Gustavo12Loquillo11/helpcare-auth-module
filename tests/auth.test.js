const request = require('supertest');
const crearApp = require('../src/app');
const userStore = require('../src/models/userStore');

const app = crearApp();

describe('POST /api/auth/registro', () => {
  beforeEach(() => {
    userStore.reset();
  });

  it('registra una persona donante con datos válidos', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: '12345678',
    });
    expect(res.status).toBe(201);
    expect(res.body.usuario.rol).toBe('donante');
    expect(res.body.token).toBeDefined();
  });

  it('rechaza el registro con datos inválidos', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'A',
      email: 'no-es-un-correo',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.errores.length).toBeGreaterThan(0);
  });

  it('rechaza el registro si el correo ya existe', async () => {
    await request(app).post('/api/auth/registro').send({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: '12345678',
    });
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'Ana Otra',
      email: 'ana@example.com',
      password: '12345678',
    });
    expect(res.status).toBe(409);
  });

  it('no permite asignar rol administrador sin autenticación previa', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'Carlos',
      email: 'carlos@example.com',
      password: '12345678',
      rol: 'administrador',
    });
    expect(res.status).toBe(201);
    expect(res.body.usuario.rol).toBe('donante');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    userStore.reset();
    await request(app).post('/api/auth/registro').send({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: '12345678',
    });
  });

  it('inicia sesión con credenciales correctas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: '12345678',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rechaza credenciales con contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: 'incorrecta',
    });
    expect(res.status).toBe(401);
  });

  it('rechaza credenciales con correo inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@example.com',
      password: '12345678',
    });
    expect(res.status).toBe(401);
  });

  it('rechaza login sin correo o contraseña', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});
