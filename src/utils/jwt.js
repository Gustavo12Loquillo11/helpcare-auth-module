const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'helpcare_dev_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

function generarToken(usuario) {
  const payload = {
    sub: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
  };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verificarToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generarToken, verificarToken, SECRET };
