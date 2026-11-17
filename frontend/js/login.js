/* ============================================================
   TRAMIX · P1 · Inicio de sesión
   Validaciones del lado cliente y verificación del usuario.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // Si ya existe una sesión abierta, se va directamente al panel.
  if (sesionActual()) {
    window.location.href = 'panel.html';
    return;
  }

  const formulario = document.getElementById('formulario-login');

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    ocultarAviso('aviso');

    const email = document.getElementById('email').value.trim();
    const clave = document.getElementById('clave').value;
    let valido = true;

    // Campo obligatorio y formato de correo electrónico.
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
      marcarError('campo-email', 'error-email', 'Ingrese su usuario.');
      valido = false;
    } else if (!formatoCorreo.test(email)) {
      marcarError('campo-email', 'error-email', 'El usuario debe tener formato de correo electrónico.');
      valido = false;
    } else {
      limpiarError('campo-email');
    }

    // Campo obligatorio y longitud mínima.
    if (clave === '') {
      marcarError('campo-clave', 'error-clave', 'Ingrese su contraseña.');
      valido = false;
    } else if (clave.length < 6) {
      marcarError('campo-clave', 'error-clave', 'La contraseña debe tener al menos 6 caracteres.');
      valido = false;
    } else {
      limpiarError('campo-clave');
    }

    if (!valido) { return; }

    const sesion = iniciarSesion(email, clave);
    if (!sesion) {
      mostrarAviso('aviso', 'error', 'Usuario o contraseña incorrectos.');
      return;
    }

    // El sistema identifica el rol y abre el panel correspondiente.
    window.location.href = 'panel.html';
  });

  function marcarError(campoId, errorId, mensaje) {
    document.getElementById(campoId).classList.add('con-error');
    document.getElementById(errorId).textContent = mensaje;
  }

  function limpiarError(campoId) {
    document.getElementById(campoId).classList.remove('con-error');
  }
});
