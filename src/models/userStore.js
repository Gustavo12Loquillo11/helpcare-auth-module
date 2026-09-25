// Almacén en memoria que simula el repositorio de usuarios del Servicio de Usuarios.
// En producción este módulo se sustituiría por consultas a PostgreSQL,
// tal como se definió en la arquitectura de HelpCare (capa de datos).

let users = [];
let nextId = 1;

function reset() {
  users = [];
  nextId = 1;
}

function findByEmail(email) {
  return users.find((u) => u.email === email);
}

function findById(id) {
  return users.find((u) => u.id === id);
}

function create({ nombre, email, passwordHash, rol }) {
  const user = {
    id: nextId++,
    nombre,
    email,
    passwordHash,
    rol: rol || 'donante',
    creadoEn: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

function all() {
  return users;
}

module.exports = { reset, findByEmail, findById, create, all };
