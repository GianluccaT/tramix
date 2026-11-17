// Servidor de TRAMIX (Indicador 7)
// Node + Express. Sirve la API (/api) y también las pantallas del frontend,
// así en local y en el despliegue todo sale de la misma dirección

// carga los datos de conexión del archivo .env (quiet para que no tire mensajes en la consola).
// En Render no hay .env: las variables se cargan en el panel del servicio
require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');
const rutasOperaciones = require('./rutas/operaciones');

const app = express();

// en local usamos el 3000; en Render el puerto lo asigna la plataforma en la variable PORT
const PUERTO = process.env.PORT || 3000;

// para que express entienda el JSON que llega en el body del POST
app.use(express.json());

// todas las rutas de operaciones arrancan con /api/operaciones
app.use('/api/operaciones', rutasOperaciones);

// las pantallas (HTML, CSS y JS) están en la carpeta frontend del repo.
// Como salen del mismo servidor que la API no hace falta CORS
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PUERTO, () => {
  console.log('Servidor de TRAMIX corriendo en el puerto ' + PUERTO);
});
