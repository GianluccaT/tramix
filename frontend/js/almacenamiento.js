/* ============================================================
   TRAMIX · Almacenamiento local
   ------------------------------------------------------------
   Sustituye temporalmente a la base de datos. Guarda las
   operaciones en localStorage para que los cambios realizados
   durante la demostración se conserven entre pantallas.
   ============================================================ */

const CLAVE_OPERACIONES = 'tramix.operaciones';
const CLAVE_SESION = 'tramix.sesion';

/* Devuelve todas las operaciones; si no existen, carga la semilla. */
function obtenerOperaciones() {
  const guardado = localStorage.getItem(CLAVE_OPERACIONES);
  if (!guardado) {
    localStorage.setItem(CLAVE_OPERACIONES, JSON.stringify(OPERACIONES_INICIALES));
    return JSON.parse(JSON.stringify(OPERACIONES_INICIALES));
  }
  try {
    return JSON.parse(guardado);
  } catch (e) {
    // Si el contenido almacenado está dañado, se vuelve a la semilla.
    localStorage.setItem(CLAVE_OPERACIONES, JSON.stringify(OPERACIONES_INICIALES));
    return JSON.parse(JSON.stringify(OPERACIONES_INICIALES));
  }
}

function guardarOperaciones(operaciones) {
  localStorage.setItem(CLAVE_OPERACIONES, JSON.stringify(operaciones));
}

function obtenerOperacion(numero) {
  return obtenerOperaciones().find(function (op) { return op.numero === numero; }) || null;
}

function actualizarOperacion(operacionModificada) {
  const operaciones = obtenerOperaciones().map(function (op) {
    return op.numero === operacionModificada.numero ? operacionModificada : op;
  });
  guardarOperaciones(operaciones);
}

function agregarOperacion(nuevaOperacion) {
  const operaciones = obtenerOperaciones();
  operaciones.unshift(nuevaOperacion);
  guardarOperaciones(operaciones);
}

/* Restablece los datos simulados a su estado original. */
function reiniciarDatos() {
  localStorage.setItem(CLAVE_OPERACIONES, JSON.stringify(OPERACIONES_INICIALES));
}

/* ---------- Utilidades de dominio ---------- */

/* Operaciones visibles según el rol (RNF03): el importador solo
   accede a las operaciones de su propia empresa. */
function operacionesVisibles(sesion) {
  const operaciones = obtenerOperaciones();
  if (sesion.rol === 'importador') {
    return operaciones.filter(function (op) { return op.importadorId === sesion.importadorId; });
  }
  return operaciones;
}

function nombreImportador(id) {
  const encontrado = IMPORTADORES.find(function (i) { return i.id === id; });
  return encontrado ? encontrado.razonSocial : '—';
}

function nombreEtapa(id) {
  const encontrada = ETAPAS.find(function (e) { return e.id === id; });
  return encontrada ? encontrada.nombre : id;
}

function nombreTransporte(id) {
  const encontrado = TRANSPORTES.find(function (t) { return t.id === id; });
  return encontrado ? encontrado.nombre : id;
}

/* Cantidad de documentos recibidos sobre el total del checklist. */
function avanceDocumental(operacion) {
  const recibidos = operacion.documentos.filter(function (d) { return d.estado === 'recibido'; }).length;
  return { recibidos: recibidos, total: operacion.documentos.length };
}

function tieneDocumentosPendientes(operacion) {
  return operacion.documentos.some(function (d) { return d.estado !== 'recibido'; });
}

/* Genera el checklist documental a partir de la plantilla del
   medio de transporte seleccionado (RF04). */
function generarChecklist(transporte) {
  return (PLANTILLAS_CHECKLIST[transporte] || []).map(function (tipo) {
    return { tipo: tipo, estado: 'pendiente', archivo: null };
  });
}

/* Sugiere el siguiente número de operación correlativo. */
function siguienteNumeroOperacion() {
  const anio = new Date().getFullYear();
  const numeros = obtenerOperaciones()
    .map(function (op) { return parseInt(op.numero.split('-')[2], 10); })
    .filter(function (n) { return !isNaN(n); });
  const ultimo = numeros.length ? Math.max.apply(null, numeros) : 0;
  return 'IMP-' + anio + '-' + String(ultimo + 1).padStart(3, '0');
}
