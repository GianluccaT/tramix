/* ============================================================
   TRAMIX · P5 · Detalle de operación
   Checklist documental con adjuntos (RF05), cambio de etapa e
   historial de movimientos (RF06). Es la pantalla donde se
   demuestra el flujo funcional completo del MVP.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  const sesion = exigirSesion();
  if (!sesion) { return; }

  const parametros = new URLSearchParams(window.location.search);
  const numero = parametros.get('numero');
  let operacion = obtenerOperacion(numero);

  dibujarEstructura('operaciones.html', 'Operaciones › ' + (numero || ''), sesion);

  // La operación no existe o no pertenece al importador conectado.
  if (!operacion || (sesion.rol === 'importador' && operacion.importadorId !== sesion.importadorId)) {
    document.querySelector('.contenido').innerHTML =
      '<div class="aviso error">No se encontró la operación solicitada o no tiene permiso para consultarla.</div>' +
      '<a class="boton secundario" href="operaciones.html">Volver al listado</a>';
    return;
  }

  if (parametros.get('creada') === '1') {
    mostrarAviso('aviso', 'exito',
      'La operación <b>' + operacion.numero + '</b> fue registrada y se generó su checklist documental (' +
      operacion.documentos.length + ' documentos).');
  }

  let indiceEnCarga = null;   // documento sobre el que se está adjuntando un archivo

  dibujar();
  dibujarPieDemo('pie-demo');

  document.getElementById('selector-archivo').addEventListener('change', procesarArchivo);
  document.getElementById('boton-etapa').addEventListener('click', cambiarEtapa);

  /* ---------- Dibujado de la pantalla ---------- */

  function dibujar() {
    dibujarCabecera();
    dibujarLineaEtapas();
    dibujarChecklist();
    dibujarHistorial();
    prepararSelectorEtapa();
  }

  function dibujarCabecera() {
    document.getElementById('cabecera').innerHTML =
      '<div>' +
        '<div class="titulo">' + operacion.numero + ' · ' + nombreImportador(operacion.importadorId) + '</div>' +
        '<div class="meta">Proveedor: ' + operacion.proveedor + ' (' + operacion.paisOrigen + ') · ' +
        nombreTransporte(operacion.transporte) + ' · Arribo estimado: ' + formatearFecha(operacion.fechaArribo) + '</div>' +
        '<div class="meta">' + operacion.descripcion + '</div>' +
      '</div>' +
      '<div>' + etiqueta(operacion.etapa, nombreEtapa(operacion.etapa)) + '</div>';
  }

  function dibujarLineaEtapas() {
    const posicionActual = ETAPAS.findIndex(function (e) { return e.id === operacion.etapa; });
    document.getElementById('linea-etapas').innerHTML = ETAPAS.map(function (etapa, indice) {
      let clase = 'paso';
      if (indice < posicionActual) { clase += ' cumplido'; }
      if (indice === posicionActual) { clase += ' actual'; }
      return '<div class="' + clase + '"><div class="punto"></div>' + etapa.nombre + '</div>';
    }).join('');
  }

  function dibujarChecklist() {
    const avance = avanceDocumental(operacion);
    document.getElementById('titulo-checklist').textContent =
      'Checklist documental (' + avance.recibidos + ' de ' + avance.total + ')';

    document.getElementById('cuerpo-checklist').innerHTML = operacion.documentos.map(function (doc, indice) {
      return '<tr>' +
        '<td>' + doc.tipo + '</td>' +
        '<td>' + (doc.archivo ? doc.archivo : '<span style="color:#6b7684">Sin archivo</span>') + '</td>' +
        '<td>' + etiqueta(doc.estado, doc.estado) + '</td>' +
        '<td style="text-align:right; white-space:nowrap">' + botonesDocumento(doc, indice) + '</td>' +
        '</tr>';
    }).join('');

    const porcentaje = avance.total === 0 ? 0 : Math.round((avance.recibidos / avance.total) * 100);
    document.getElementById('avance').innerHTML =
      'Avance documental: ' + porcentaje + '%' +
      '<div class="barra-avance"><span style="width:' + porcentaje + '%"></span></div>';

    // Los botones se generan dinámicamente: se enlazan tras dibujar.
    Array.prototype.forEach.call(document.querySelectorAll('[data-accion]'), function (boton) {
      boton.addEventListener('click', function () {
        const indice = parseInt(boton.getAttribute('data-indice'), 10);
        const accion = boton.getAttribute('data-accion');
        if (accion === 'adjuntar') { pedirArchivo(indice); }
        if (accion === 'recibido') { marcarDocumento(indice, 'recibido'); }
        if (accion === 'observado') { marcarDocumento(indice, 'observado'); }
      });
    });
  }

  function botonesDocumento(doc, indice) {
    let botones = '';
    if (puedeAdjuntarDocumentos(sesion) && operacion.etapa !== 'finalizada') {
      botones += '<button class="boton secundario chico" data-accion="adjuntar" data-indice="' + indice + '">' +
                 (doc.archivo ? 'Reemplazar' : 'Adjuntar') + '</button> ';
    }
    if (puedeValidarDocumentos(sesion) && doc.archivo && operacion.etapa !== 'finalizada') {
      if (doc.estado !== 'recibido') {
        botones += '<button class="boton primario chico" data-accion="recibido" data-indice="' + indice + '">Recibido</button> ';
      }
      if (doc.estado !== 'observado') {
        botones += '<button class="boton secundario chico" data-accion="observado" data-indice="' + indice + '">Observar</button>';
      }
    }
    return botones || '<span style="color:#6b7684; font-size:11.5px">Sin acciones</span>';
  }

  function dibujarHistorial() {
    document.getElementById('historial').innerHTML = operacion.historial.map(function (m) {
      return '<li>' + m.texto + '<span class="cuando">' + formatearFecha(m.fecha) + ' · ' + m.usuario + '</span></li>';
    }).join('');
  }

  /* El selector de etapa y su botón solo se habilitan para el
     despachante (el importador consulta, no modifica). */
  function prepararSelectorEtapa() {
    if (!puedeValidarDocumentos(sesion)) {
      document.getElementById('caja-etapa').style.display = 'none';
      return;
    }
    document.getElementById('nueva-etapa').innerHTML = ETAPAS.map(function (e) {
      const seleccionada = e.id === operacion.etapa ? ' selected' : '';
      return '<option value="' + e.id + '"' + seleccionada + '>' + e.nombre + '</option>';
    }).join('');
  }

  /* ---------- Acciones ---------- */

  function pedirArchivo(indice) {
    indiceEnCarga = indice;
    document.getElementById('selector-archivo').click();
  }

  /* Valida tipo y tamaño del archivo antes de aceptarlo (RNF02).
     El archivo no se sube a ningún servidor: en esta etapa solo se
     registra su nombre para representar el comportamiento. */
  function procesarArchivo(evento) {
    const archivo = evento.target.files[0];
    if (!archivo || indiceEnCarga === null) { return; }

    const extensionesValidas = ['pdf', 'jpg', 'jpeg', 'png'];
    const extension = archivo.name.split('.').pop().toLowerCase();
    const tamanoMaximo = 5 * 1024 * 1024;

    if (extensionesValidas.indexOf(extension) === -1) {
      mostrarAviso('aviso', 'error', 'Formato no admitido: solo se aceptan archivos PDF, JPG o PNG.');
    } else if (archivo.size > tamanoMaximo) {
      mostrarAviso('aviso', 'error', 'El archivo supera el tamaño máximo permitido de 5 MB.');
    } else {
      const documento = operacion.documentos[indiceEnCarga];
      documento.archivo = archivo.name;
      // El importador adjunta y el documento queda a la espera de validación.
      documento.estado = puedeValidarDocumentos(sesion) ? 'recibido' : 'pendiente';
      registrarHistorial(operacion, sesion, 'Documento adjuntado: ' + documento.tipo + '.');
      actualizarOperacion(operacion);
      mostrarAviso('aviso', 'exito', 'Se adjuntó el archivo <b>' + archivo.name + '</b> a «' + documento.tipo + '».');
      dibujar();
    }

    evento.target.value = '';
    indiceEnCarga = null;
  }

  function marcarDocumento(indice, estado) {
    const documento = operacion.documentos[indice];
    documento.estado = estado;
    registrarHistorial(operacion, sesion,
      documento.tipo + ' marcado como ' + estado + '.');
    actualizarOperacion(operacion);
    mostrarAviso('aviso', 'exito', 'El documento «' + documento.tipo + '» quedó como ' + estado + '.');
    dibujar();
  }

  function cambiarEtapa() {
    const seleccionada = document.getElementById('nueva-etapa').value;

    if (seleccionada === operacion.etapa) {
      mostrarAviso('aviso', 'informacion', 'La operación ya se encuentra en la etapa seleccionada.');
      return;
    }

    // Regla de negocio: no se puede declarar documentación completa
    // si el checklist tiene documentos pendientes u observados.
    if (seleccionada === 'doc_completa' && tieneDocumentosPendientes(operacion)) {
      const avance = avanceDocumental(operacion);
      mostrarAviso('aviso', 'error',
        'No es posible pasar a «Doc. completa»: hay ' + (avance.total - avance.recibidos) +
        ' documento(s) sin recibir en el checklist.');
      return;
    }

    const anterior = nombreEtapa(operacion.etapa);
    operacion.etapa = seleccionada;
    registrarHistorial(operacion, sesion, 'Etapa actualizada de ' + anterior + ' a ' + nombreEtapa(seleccionada) + '.');
    actualizarOperacion(operacion);
    mostrarAviso('aviso', 'exito', 'La etapa se actualizó a <b>' + nombreEtapa(seleccionada) + '</b>.');
    dibujar();
  }
});
