const express = require('express');
const authRoutes = require('./routes/auth');
const donantesRoutes = require('./routes/donantes');

function crearApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

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
