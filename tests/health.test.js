const request = require('supertest');
const crearApp = require('../src/app');

const app = crearApp();

describe('GET /health', () => {
  const commitOriginal = process.env.RENDER_GIT_COMMIT;

  afterEach(() => {
    if (commitOriginal === undefined) {
      delete process.env.RENDER_GIT_COMMIT;
    } else {
      process.env.RENDER_GIT_COMMIT = commitOriginal;
    }
  });

  it('responde ok e indica "local" fuera de Render', async () => {
    delete process.env.RENDER_GIT_COMMIT;
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', commit: 'local' });
  });

  it('devuelve el commit desplegado cuando Render lo informa', async () => {
    process.env.RENDER_GIT_COMMIT = 'abc123';
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.commit).toBe('abc123');
  });
});
