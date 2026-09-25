const express = require('express');
const userStore = require('../models/userStore');
const { autenticar, autorizar } = require('../middleware/auth');

const router = express.Router();

// Perfil propio: cualquier usuario autenticado.
router.get('/perfil', autenticar, (req, res) => {
  const usuario = userStore.findById(req.usuario.sub);
  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  return res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  });
});

// Listado de personas donantes: solo administradores.
router.get('/', autenticar, autorizar('administrador'), (req, res) => {
  const donantes = userStore.all().map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
  }));
  return res.json(donantes);
});

module.exports = router;
