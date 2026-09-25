const express = require('express');
const authRoutes = require('./routes/auth');
const donantesRoutes = require('./routes/donantes');

function crearApp() {
  const app = express();
  app.use(express.json());

  // RENDER_GIT_COMMIT lo define Render en cada despliegue; el pipeline lo usa
  // para confirmar que el entorno de prueba ya sirve la versión nueva.
  app.get('/health', (req, res) =>
    res.json({ status: 'ok', commit: process.env.RENDER_GIT_COMMIT || 'local' })
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/donantes', donantesRoutes);

  // Manejo centralizado de errores no controlados.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = crearApp;
