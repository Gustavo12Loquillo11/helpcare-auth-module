const express = require('express');
const userStore = require('../models/userStore');
const { hashPassword, comparePassword } = require('../utils/password');
const { generarToken } = require('../utils/jwt');
const { validarRegistro } = require('../validators/donanteValidator');
const { autenticarOpcional } = require('../middleware/auth');

const router = express.Router();

// Registro de personas donantes (rol por defecto: donante).
router.post('/registro', autenticarOpcional, async (req, res) => {
  const { nombre, email, password, rol } = req.body || {};

  const errores = validarRegistro({ nombre, email, password });
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  if (userStore.findByEmail(email)) {
    return res.status(409).json({ error: 'El correo ya está registrado' });
  }

  // Solo se permite crear administradores si la petición viene de un admin autenticado.
  let rolFinal = 'donante';
  if (rol === 'administrador' && req.usuario && req.usuario.rol === 'administrador') {
    rolFinal = 'administrador';
  }

  const passwordHash = await hashPassword(password);
  const usuario = userStore.create({ nombre, email, passwordHash, rol: rolFinal });

  const token = generarToken(usuario);
  return res.status(201).json({
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    token,
  });
});

// Inicio de sesión.
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const usuario = userStore.findByEmail(email);
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const passwordValido = await comparePassword(password, usuario.passwordHash);
  if (!passwordValido) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generarToken(usuario);
  return res.json({
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    token,
  });
});

module.exports = router;
