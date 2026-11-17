/* ============================================================
   TRAMIX · P3 · Listado de operaciones
   Búsqueda y filtrado en memoria sobre los datos recibidos de la API.
   La tabla se vuelve a dibujar con cada cambio del usuario.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  const sesion = exigirSesion();
  if (!sesion) { return; }

  dibujarEstructura('operaciones.html', 'Operaciones', sesion);

  // ahora las operaciones ya no salen del arreglo de datos.js, las traemos de la API
  let todas = [];
  let cargado = false;

  prepararFiltros();
  cargarOperaciones();
  dibujarPieDemo('pie-demo');

  // Cada control vuelve a filtrar el listado sin recargar la página.
  document.getElementById('busqueda').addEventListener('input', dibujarTabla);
  document.getElementById('filtro-etapa').addEventListener('change', dibujarTabla);
  document.getElementById('filtro-importador').addEventListener('change', dibujarTabla);
  document.getElementById('filtro-transporte').addEventListener('change', dibujarTabla);

  document.getElementById('boton-limpiar').addEventListener('click', function () {
    document.getElementById('busqueda').value = '';
    document.getElementById('filtro-etapa').value = '';
    document.getElementById('filtro-importador').value = '';
    document.getElementById('filtro-transporte').value = '';
    dibujarTabla();
  });

  // GET /operaciones con fetch()
  function cargarOperaciones() {
    // estado de carga: avisamos que se están trayendo los datos
    document.getElementById('cuerpo-tabla').innerHTML =
      '<tr><td colspan="7" class="vacio">Cargando operaciones...</td></tr>';
    document.getElementById('contador').textContent = 'Obteniendo datos de la API...';

    fetch(URL_API + '/operaciones')
      .then(response => {
        // si el servidor responde con error (404, 500, etc.) lo mandamos directo al catch
        if (!response.ok) {
          throw new Error('El servidor respondió con el código ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        // el importador solo ve lo de su empresa. Por ahora lo filtramos acá,
        // después eso lo va a hacer el backend con el token del usuario
        if (sesion.rol === 'importador') {
          todas = data.filter(op => op.importadorId === sesion.importadorId);
        } else {
          todas = data;
        }
        cargado = true;
        dibujarTabla();

        // si venimos del formulario de alta, avisamos que la operación ya quedó guardada
        const creada = new URLSearchParams(window.location.search).get('creada');
        if (creada) {
          mostrarAviso('aviso', 'exito', 'La operación <b>' + creada + '</b> se guardó en la base de datos.');
        }
      })
      .catch(error => {
        // estado de error: mensaje en pantalla y en consola solo como apoyo
        console.error('Error al obtener las operaciones:', error);
        mostrarAviso('aviso', 'error',
          'No fue posible obtener las operaciones desde la API.');
        document.getElementById('cuerpo-tabla').innerHTML =
          '<tr><td colspan="7" class="vacio">No se pudieron cargar las operaciones.</td></tr>';
        document.getElementById('contador').textContent = '';
      });
  }

  /* Carga las opciones de los tres selectores. El importador no
     necesita el filtro por empresa: solo ve la suya. */
  function prepararFiltros() {
    const selectorEtapa = document.getElementById('filtro-etapa');
    selectorEtapa.innerHTML = '<option value="">Etapa: todas</option>' +
      ETAPAS.map(function (e) { return '<option value="' + e.id + '">' + e.nombre + '</option>'; }).join('');

    const selectorImportador = document.getElementById('filtro-importador');
    if (sesion.rol === 'importador') {
      selectorImportador.style.display = 'none';
    } else {
      selectorImportador.innerHTML = '<option value="">Importador: todos</option>' +
        IMPORTADORES.map(function (i) { return '<option value="' + i.id + '">' + i.razonSocial + '</option>'; }).join('');
    }

    const selectorTransporte = document.getElementById('filtro-transporte');
    selectorTransporte.innerHTML = '<option value="">Transporte: todos</option>' +
      TRANSPORTES.map(function (t) { return '<option value="' + t.id + '">' + t.nombre + '</option>'; }).join('');
  }

  function dibujarTabla() {
    // mientras no llegan los datos no filtramos nada
    if (!cargado) { return; }

    const texto = document.getElementById('busqueda').value.trim().toLowerCase();
    const etapa = document.getElementById('filtro-etapa').value;
    const importador = document.getElementById('filtro-importador').value;
    const transporte = document.getElementById('filtro-transporte').value;

    const filtradas = todas.filter(function (op) {
      const coincideTexto = texto === '' ||
        op.numero.toLowerCase().indexOf(texto) !== -1 ||
        op.proveedor.toLowerCase().indexOf(texto) !== -1;
      const coincideEtapa = etapa === '' || op.etapa === etapa;
      const coincideImportador = importador === '' || op.importadorId === importador;
      const coincideTransporte = transporte === '' || op.transporte === transporte;
      return coincideTexto && coincideEtapa && coincideImportador && coincideTransporte;
    });

    const cuerpo = document.getElementById('cuerpo-tabla');

    if (filtradas.length === 0) {
      cuerpo.innerHTML = '<tr><td colspan="7" class="vacio">No se encontraron operaciones con los criterios indicados.</td></tr>';
    } else {
      cuerpo.innerHTML = filtradas.map(function (op) {
        const avance = avanceDocumental(op);
        return '<tr>' +
          '<td>' + op.numero + '</td>' +
          '<td>' + nombreImportador(op.importadorId) + '</td>' +
          '<td>' + nombreTransporte(op.transporte) + '</td>' +
          '<td>' + formatearFecha(op.fechaArribo) + '</td>' +
          '<td>' + avance.recibidos + ' / ' + avance.total + '</td>' +
          '<td>' + etiqueta(op.etapa, nombreEtapa(op.etapa)) + '</td>' +
          '<td><a class="boton secundario chico" href="detalle.html?numero=' + op.numero + '">Ver</a></td>' +
          '</tr>';
      }).join('');
    }

    document.getElementById('contador').textContent =
      'Mostrando ' + filtradas.length + ' de ' + todas.length + ' operaciones.';
  }
});
