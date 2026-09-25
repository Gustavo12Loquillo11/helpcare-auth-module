const { verificarToken } = require('../utils/jwt');

// Verifica que la petición traiga un token JWT válido en el header Authorization.
function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = verificarToken(token);
    req.usuario = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Restringe el acceso a los roles indicados (por ejemplo: administrador).
function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    return next();
  };
}

// Autenticación opcional: si viene un token válido, adjunta req.usuario;
// si no viene o es inválido, continúa sin bloquear la petición.
// Se usa en /registro para permitir que un admin autenticado cree otro admin.
function autenticarOpcional(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      req.usuario = verificarToken(token);
    } catch (err) {
      // Token inválido: se ignora y la petición continúa como anónima.
    }
  }
  return next();
}

module.exports = { autenticar, autorizar, autenticarOpcional };
