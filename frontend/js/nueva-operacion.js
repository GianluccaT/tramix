/* ============================================================
   TRAMIX · P4 · Alta de operación
   Formulario funcional con validaciones del lado cliente.
   Al guardar, genera el checklist documental correspondiente
   al medio de transporte seleccionado (RF03 y RF04).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  const sesion = exigirSesion();
  if (!sesion) { return; }

  // Solo el despachante registra operaciones.
  if (!puedeRegistrarOperaciones(sesion)) {
    window.location.href = 'panel.html';
    return;
  }

  dibujarEstructura('nueva-operacion.html', 'Nueva operación', sesion);
  prepararSelectores();
  document.getElementById('numero').value = siguienteNumeroOperacion();
  actualizarVistaChecklist();
  dibujarPieDemo('pie-demo');

  document.getElementById('transporte').addEventListener('change', actualizarVistaChecklist);
  document.getElementById('formulario-operacion').addEventListener('submit', guardar);

  function prepararSelectores() {
    document.getElementById('importador').innerHTML =
      '<option value="">Seleccionar importador…</option>' +
      IMPORTADORES.map(function (i) { return '<option value="' + i.id + '">' + i.razonSocial + '</option>'; }).join('');

    document.getElementById('transporte').innerHTML =
      TRANSPORTES.map(function (t) { return '<option value="' + t.id + '">' + t.nombre + '</option>'; }).join('');
  }

  /* Muestra, antes de guardar, qué documentos se van a exigir. */
  function actualizarVistaChecklist() {
    const transporte = document.getElementById('transporte').value;
    const documentos = PLANTILLAS_CHECKLIST[transporte] || [];
    document.getElementById('vista-checklist').innerHTML =
      'Al guardar se generará el checklist documental del transporte <b>' +
      nombreTransporte(transporte).toLowerCase() + '</b> (' + documentos.length + ' documentos): ' +
      documentos.join(' · ') + '.';
  }

  function guardar(evento) {
    evento.preventDefault();
    ocultarAviso('aviso');

    const datos = {
      numero: document.getElementById('numero').value.trim().toUpperCase(),
      importadorId: document.getElementById('importador').value,
      proveedor: document.getElementById('proveedor').value.trim(),
      paisOrigen: document.getElementById('pais').value.trim(),
      transporte: document.getElementById('transporte').value,
      fechaArribo: document.getElementById('arribo').value,
      descripcion: document.getElementById('descripcion').value.trim()
    };

    if (!validar(datos)) {
      mostrarAviso('aviso', 'error', 'Revise los campos marcados: hay datos obligatorios o con formato incorrecto.');
      return;
    }

    // ahora sí: mandamos la operación al backend con POST y se guarda en MySQL.
    // La etapa y el checklist los arma el backend, acá solo va lo que cargó el usuario
    let estado;

    fetch(URL_API + '/operaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(response => {
        estado = response.status;
        return response.json();
      })
      .then(data => {
        // si no vino 201 es que el backend no la aceptó (400, 409...), mostramos su mensaje
        if (estado !== 201) {
          mostrarAviso('aviso', 'error', data.error);
          return;
        }

        // el detalle todavía trabaja con localStorage, así que la guardamos ahí también para poder abrirla
        data.historial = [];
        registrarHistorial(data, sesion, 'Operación registrada.');
        agregarOperacion(data);

        // volvemos al listado, que la va a traer de la base con el GET
        window.location.href = 'operaciones.html?creada=' + data.numero;
      })
      .catch(error => {
        console.error('Error al registrar la operación:', error);
        mostrarAviso('aviso', 'error', 'No fue posible conectar con el servidor. Verifique que el backend esté corriendo.');
      });
  }

  /* Validaciones: campos obligatorios, formato del número, fecha
     válida y longitud mínima de la descripción. */
  function validar(datos) {
    let valido = true;

    const formatoNumero = /^IMP-\d{4}-\d{3}$/;
    if (datos.numero === '') {
      error('campo-numero', 'error-numero', 'Ingrese el número de operación.');
      valido = false;
    } else if (!formatoNumero.test(datos.numero)) {
      error('campo-numero', 'error-numero', 'Formato esperado: IMP-AAAA-NNN (ejemplo: IMP-2026-042).');
      valido = false;
    } else if (obtenerOperacion(datos.numero)) {
      error('campo-numero', 'error-numero', 'Ya existe una operación con ese número.');
      valido = false;
    } else {
      limpiar('campo-numero');
    }

    if (datos.importadorId === '') {
      error('campo-importador', 'error-importador', 'Seleccione el importador.');
      valido = false;
    } else {
      limpiar('campo-importador');
    }

    if (datos.proveedor.length < 3) {
      error('campo-proveedor', 'error-proveedor', 'Ingrese el proveedor (mínimo 3 caracteres).');
      valido = false;
    } else {
      limpiar('campo-proveedor');
    }

    if (datos.paisOrigen === '') {
      error('campo-pais', 'error-pais', 'Ingrese el país de origen.');
      valido = false;
    } else {
      limpiar('campo-pais');
    }

    if (datos.transporte === '') {
      error('campo-transporte', 'error-transporte', 'Seleccione el medio de transporte.');
      valido = false;
    } else {
      limpiar('campo-transporte');
    }

    // Fecha obligatoria, válida y no anterior al día de hoy.
    if (datos.fechaArribo === '') {
      error('campo-arribo', 'error-arribo', 'Ingrese la fecha estimada de arribo.');
      valido = false;
    } else if (isNaN(new Date(datos.fechaArribo).getTime())) {
      error('campo-arribo', 'error-arribo', 'La fecha ingresada no es válida.');
      valido = false;
    } else if (datos.fechaArribo < fechaDeHoy()) {
      error('campo-arribo', 'error-arribo', 'La fecha de arribo no puede ser anterior a hoy.');
      valido = false;
    } else {
      limpiar('campo-arribo');
    }

    if (datos.descripcion.length < 10) {
      error('campo-descripcion', 'error-descripcion', 'Describa la mercadería (mínimo 10 caracteres).');
      valido = false;
    } else {
      limpiar('campo-descripcion');
    }

    return valido;
  }

  function error(campoId, errorId, mensaje) {
    document.getElementById(campoId).classList.add('con-error');
    document.getElementById(errorId).textContent = mensaje;
  }

  function limpiar(campoId) {
    document.getElementById(campoId).classList.remove('con-error');
  }
});
