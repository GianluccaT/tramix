/* ============================================================
   TRAMIX · Funciones comunes a todas las pantallas
   ------------------------------------------------------------
   Construye la barra superior y el menú lateral en función del
   rol, y agrupa las utilidades de presentación reutilizadas.
   ============================================================ */

/* Dibuja la cabecera y el menú lateral. Recibe la página activa
   y el texto de la ruta que se muestra junto a la marca. */
function dibujarEstructura(paginaActiva, ruta, sesion) {
  const opciones = [
    { archivo: 'panel.html',            texto: 'Panel',            roles: ['despachante', 'importador', 'administrador'] },
    { archivo: 'operaciones.html',      texto: 'Operaciones',      roles: ['despachante', 'importador', 'administrador'] },
    { archivo: 'nueva-operacion.html',  texto: 'Nueva operación',  roles: ['despachante'] }
  ];

  const enlaces = opciones
    .filter(function (o) { return o.roles.indexOf(sesion.rol) !== -1; })
    .map(function (o) {
      const clase = o.archivo === paginaActiva ? ' class="activo"' : '';
      return '<a href="' + o.archivo + '"' + clase + '>' + o.texto + '</a>';
    })
    .join('');

  document.getElementById('barra-superior').innerHTML =
    '<span class="marca">TRAMIX</span>' +
    '<span class="ruta">' + ruta + '</span>' +
    '<span class="usuario">' + sesion.nombre + ' · ' + nombreRol(sesion.rol) + '</span>';

  document.getElementById('menu-lateral').innerHTML =
    enlaces +
    '<div class="separador"></div>' +
    '<a href="#" id="enlace-salir">Cerrar sesión</a>';

  document.getElementById('enlace-salir').addEventListener('click', function (evento) {
    evento.preventDefault();
    cerrarSesion();
  });
}

/* Etiqueta de color para una etapa o un estado documental. */
function etiqueta(valor, texto) {
  return '<span class="etiqueta et-' + valor + '">' + texto + '</span>';
}

/* Convierte 2026-09-02 en 02/09/2026. */
function formatearFecha(iso) {
  if (!iso) { return '—'; }
  const partes = iso.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function fechaDeHoy() {
  const hoy = new Date();
  return hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0');
}

/* Muestra un aviso en pantalla (éxito, error o información). */
function mostrarAviso(id, tipo, texto) {
  const caja = document.getElementById(id);
  caja.className = 'aviso ' + tipo;
  caja.innerHTML = texto;
}

function ocultarAviso(id) {
  document.getElementById(id).className = 'aviso oculto';
}

/* Registra un movimiento en el historial de la operación (RF06). */
function registrarHistorial(operacion, sesion, texto) {
  operacion.historial.unshift({ fecha: fechaDeHoy(), usuario: sesion.nombre, texto: texto });
}

/* Pie de página con el botón para restablecer los datos simulados
   antes de una nueva demostración. */
function dibujarPieDemo(contenedorId) {
  const pie = document.getElementById(contenedorId);
  if (!pie) { return; }
  pie.innerHTML =
    '<span>TRAMIX · El alta y el listado de operaciones se guardan en MySQL a través de la API.</span>' +
    '<button type="button" class="boton secundario chico" id="boton-reiniciar">Restablecer datos de demostración</button>';
  document.getElementById('boton-reiniciar').addEventListener('click', function () {
    reiniciarDatos();
    window.location.reload();
  });
}
