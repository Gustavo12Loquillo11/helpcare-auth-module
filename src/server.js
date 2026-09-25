require('dotenv').config();
const crearApp = require('./app');

const PORT = process.env.PORT || 3000;
const app = crearApp();

app.listen(PORT, () => {
  console.log(`HelpCare Auth Module escuchando en el puerto ${PORT}`);
});
