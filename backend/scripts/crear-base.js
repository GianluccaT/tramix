// Crea la base, las tablas y los datos de ejemplo ejecutando base_datos/tramix.sql
// Sirve para la base local y para la de la nube: usa las mismas variables del .env
// Uso: npm run db:init
// OJO: si las tablas ya existen las borra y las vuelve a crear

require('dotenv').config({ quiet: true });

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function crearBase() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'base_datos', 'tramix.sql'), 'utf8');

  // sin "database" porque la base todavía puede no existir; el script la crea
  const cx = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
    multipleStatements: true   // para correr todo el archivo de una
  });

  await cx.query(sql);

  const [filas] = await cx.query('SELECT COUNT(*) AS total FROM operaciones');
  console.log('Base lista. Operaciones cargadas: ' + filas[0].total);

  await cx.end();
}

crearBase().catch(error => {
  console.error('No se pudo crear la base:', error.message);
  process.exit(1);
});
