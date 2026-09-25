# HelpCare — Módulo de Registro de Personas Donantes (Punto 1: Implementación y seguridad)

Este módulo corresponde al **Servicio de Autenticación / Servicio de Usuarios** definido
en la arquitectura de microservicios de HelpCare. Implementa el registro de personas
donantes con autenticación JWT y control de acceso por rol
(`administrador` / `donante`).

## 1. Estructura del proyecto

```
helpcare-auth-module/
├── src/
│   ├── app.js                  # Configuración de Express (rutas, middlewares)
│   ├── server.js               # Punto de entrada (levanta el servidor)
│   ├── models/userStore.js     # Repositorio de usuarios (en memoria; sustituible por PostgreSQL)
│   ├── utils/password.js       # Hash y verificación de contraseñas (bcrypt)
│   ├── utils/jwt.js            # Generación y verificación de tokens JWT
│   ├── middleware/auth.js      # Middlewares: autenticar, autorizar, autenticarOpcional
│   ├── validators/donanteValidator.js  # Validación de datos de registro
│   └── routes/
│       ├── auth.js             # POST /api/auth/registro, POST /api/auth/login
│       └── donantes.js         # GET /api/donantes/perfil, GET /api/donantes (admin)
├── tests/                      # Pruebas unitarias (Jest + Supertest)
├── .github/workflows/ci-cd.yml # Pipeline de CI/CD (GitHub Actions)
├── Dockerfile
├── .node-version               # Versión de Node (CI, Docker y Render usan la misma)
├── .env.example
└── package.json
```

## 2. Autenticación JWT y roles

- **Registro** (`POST /api/auth/registro`): crea una persona donante (rol `donante`
  por defecto). Un administrador ya autenticado puede crear otro administrador
  enviando `"rol": "administrador"` junto con su propio token en el header
  `Authorization`.
- **Login** (`POST /api/auth/login`): valida credenciales contra el hash bcrypt
  almacenado y devuelve un JWT firmado con el `id`, `email` y `rol` del usuario.
- **Middleware `autenticar`**: exige un header `Authorization: Bearer <token>`
  válido; si falta o el token es inválido/expiró, responde `401`.
- **Middleware `autorizar(...roles)`**: verifica que el rol del usuario autenticado
  esté en la lista permitida; si no, responde `403`. Se usa para proteger
  `GET /api/donantes` (solo `administrador`).
- Las contraseñas nunca se almacenan en texto plano: se guardan con
  `bcryptjs` (10 salt rounds).

### Endpoints

| Método | Ruta                  | Protección                  | Descripción                              |
|--------|-----------------------|------------------------------|-------------------------------------------|
| POST   | `/api/auth/registro`  | Pública (opcionalmente admin)| Registra una persona donante o admin     |
| POST   | `/api/auth/login`     | Pública                     | Inicia sesión y devuelve un JWT          |
| GET    | `/api/donantes/perfil`| JWT (cualquier rol)          | Devuelve el perfil del usuario autenticado|
| GET    | `/api/donantes`       | JWT + rol `administrador`    | Lista todas las personas donantes         |

## 3. Pruebas unitarias (Jest + Supertest)

Se cubrieron los flujos principales y sus casos límite:

- Registro: datos válidos, datos inválidos, correo duplicado, intento de crear
  admin sin sesión, creación de admin por otro admin.
- Login: credenciales correctas, contraseña incorrecta, correo inexistente,
  campos faltantes.
- Rutas protegidas: sin token, token mal formado, token inválido, acceso
  permitido al propio perfil, acceso denegado por rol (403), usuario borrado
  después de emitido el token (404).
- Utilidades puras: validador de registro, generación/verificación de JWT,
  hashing y comparación de contraseñas.

Con este conjunto de pruebas se cubren prácticamente todas las líneas y ramas
de `src/`, cumpliendo el umbral de cobertura del 80% configurado en
`package.json` (`coverageThreshold`). Al ejecutar `npm test`, Jest falla el
build si la cobertura cae por debajo de ese umbral.

**Para correrlo localmente** (requiere Node.js 24 LTS, la versión fijada en
`.node-version`, y conexión a internet para instalar dependencias):

```bash
npm install
npm test          # ejecuta las pruebas y genera el reporte de cobertura
npm run lint       # valida el estilo de código
npm start          # levanta el servidor en http://localhost:3000
```

## 4. Pipeline de CI/CD (GitHub Actions)

El archivo `.github/workflows/ci-cd.yml` define tres jobs encadenados:

1. **test** — en cada push/PR: instala dependencias, corre `eslint` y ejecuta
   `npm test` con cobertura; publica el reporte como artefacto
   (`coverage-report`).
2. **build** — si las pruebas pasan: construye la imagen Docker del servicio,
   la arranca y comprueba que responde en `/health` (prueba de humo).
3. **deploy** — solo en la rama `main` y solo si `test` y `build` pasaron:
   llama al *Deploy Hook* de Render para desplegar el último commit en el
   entorno de prueba y espera hasta que `GET /health` responda con ese mismo
   commit, de modo que el job solo termina en verde si el despliegue quedó
   realmente activo.

Esto cumple el requisito de integración y entrega continua: cada cambio se
prueba automáticamente y, si todo pasa, se construye y despliega sin
intervención manual.

### Entorno de prueba en Render

- **Servicio:** *Web Service* de Render conectado a este repositorio, rama
  `main`, runtime Node, `Build Command: npm install`,
  `Start Command: npm start`, plan gratuito. La versión de Node se toma de
  `.node-version`.
- **Auto-Deploy:** desactivado (`Off`), para que el único que despliega sea
  el pipeline y nunca llegue al entorno un commit que no pasó las pruebas.
- **Variables de entorno en Render:** `JWT_SECRET` con un valor largo y
  aleatorio (si falta, la app usa un secreto de desarrollo inseguro).
  `PORT` y `RENDER_GIT_COMMIT` los define Render automáticamente.

### Configuración necesaria en GitHub

En *Settings → Secrets and variables → Actions*:

| Tipo      | Nombre                | Valor                                                        |
|-----------|-----------------------|--------------------------------------------------------------|
| Secret    | `RENDER_DEPLOY_HOOK`  | URL del Deploy Hook (Render → servicio → Settings → Deploy Hook) |
| Variable  | `RENDER_SERVICE_URL`  | URL pública del servicio, p. ej. `https://helpcare-auth-module.onrender.com` |

El Deploy Hook es una credencial: cualquiera que tenga esa URL puede lanzar
despliegues, por eso va como *secret* (GitHub lo oculta en los logs) y nunca
en el código.

## 5. Notas para el informe de cierre

- El almacenamiento de usuarios está en memoria para simplificar la entrega
  del módulo; en producción se conecta a PostgreSQL como define la
  arquitectura del proyecto (capa de datos, Servicio de Usuarios).
- El secreto de JWT (`JWT_SECRET`) debe definirse como variable de entorno /
  secreto de CI, nunca quedar hardcodeado en el repositorio.
- Próximos pasos sugeridos: refresh tokens, límite de intentos de login
  (rate limiting) y persistencia real en PostgreSQL con migraciones.
