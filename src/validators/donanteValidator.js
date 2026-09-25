function validarRegistro({ nombre, email, password }) {
  const errores = [];

  if (!nombre || nombre.trim().length < 2) {
    errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El correo electrónico no es válido');
  }

  if (!password || password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  return errores;
}

module.exports = { validarRegistro };
