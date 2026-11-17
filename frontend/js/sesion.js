/* ============================================================
   TRAMIX · Sesión y control de acceso por rol (RF01 / RNF03)
   ------------------------------------------------------------
   La autenticación real (token JWT y contraseñas con hash) se
   implementará junto con el backend. En esta etapa la validación
   se realiza contra el arreglo USUARIOS de datos.js.
   ============================================================ */

function iniciarSesion(email, clave) {
  const usuario = USUARIOS.find(function (u) {
    return u.email.toLowerCase() === email.toLowerCase() && u.clave === clave;
  });
  if (!usuario) { return null; }

  const sesion = {
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
    importadorId: usuario.importadorId
  };
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  return sesion;
}

function sesionActual() {
  const guardada = localStorage.getItem(CLAVE_SESION);
  return guardada ? JSON.parse(guardada) : null;
}

function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  window.location.href = 'index.html';
}

/* Protege las pantallas internas: si no hay sesión, vuelve a P1. */
function exigirSesion() {
  const sesion = sesionActual();
  if (!sesion) {
    window.location.href = 'index.html';
    return null;
  }
  return sesion;
}

/* Permisos derivados del rol. */
function puedeRegistrarOperaciones(sesion) {
  return sesion.rol === 'despachante';
}

/* Solo el despachante valida el estado de un documento y cambia la
   etapa; el importador únicamente adjunta sus documentos. */
function puedeValidarDocumentos(sesion) {
  return sesion.rol === 'despachante';
}

function puedeAdjuntarDocumentos(sesion) {
  return sesion.rol === 'despachante' || sesion.rol === 'importador';
}

function nombreRol(rol) {
  const nombres = { despachante: 'Despachante', importador: 'Importador', administrador: 'Administrador' };
  return nombres[rol] || rol;
}
