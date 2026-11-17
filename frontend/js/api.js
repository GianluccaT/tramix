/* ============================================================
   TRAMIX · Conexión con la API
   ============================================================ */

// El frontend lo sirve el mismo backend (Express), así que alcanza con la ruta relativa:
// en local queda http://localhost:3000/api y en Render queda https://<nuestro-servicio>.onrender.com/api.
// Antes acá estaba escrito http://localhost:3000/api y en el despliegue no iba a andar
const URL_API = '/api';
