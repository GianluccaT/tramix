// Conexión con la base de datos MySQL
// Los datos de acceso salen de las variables de entorno: en local del archivo .env
// (no se sube al repo, hay un .env.example de guía) y en Render del panel del servicio

const mysql = require('mysql2/promise');

const conexion = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // así las fechas vienen como texto '2026-11-05' y no como objeto Date con zona horaria
  dateStrings: true,
  // la base en la nube (TiDB Cloud) exige conexión cifrada; en local con MySQL no hace falta
  ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined
});

module.exports = conexion;
