/* ============================================================
   TRAMIX · P2 · Panel principal
   Calcula los indicadores por etapa a partir de los datos
   simulados y muestra las últimas operaciones (RF08).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  const sesion = exigirSesion();
  if (!sesion) { return; }

  dibujarEstructura('panel.html', 'Panel principal', sesion);

  const operaciones = operacionesVisibles(sesion);

  document.getElementById('subtitulo').textContent =
    sesion.rol === 'importador'
      ? 'Resumen de las operaciones de ' + nombreImportador(sesion.importadorId)
      : 'Resumen de la cartera de operaciones.';

  dibujarIndicadores(operaciones);
  dibujarUltimasOperaciones(operaciones);
  dibujarPieDemo('pie-demo');

  /* Cuenta las operaciones por etapa y las que tienen documentos
     pendientes. Los valores se calculan siempre a partir de los
     datos, nunca se escriben fijos en la pantalla. */
  function dibujarIndicadores(lista) {
    const enTransito = lista.filter(function (op) { return op.etapa === 'en_transito'; }).length;
    const enDespacho = lista.filter(function (op) { return op.etapa === 'en_despacho'; }).length;
    const finalizadas = lista.filter(function (op) { return op.etapa === 'finalizada'; }).length;
    const conPendientes = lista.filter(function (op) {
      return op.etapa !== 'finalizada' && tieneDocumentosPendientes(op);
    }).length;

    const tarjetas = [
      { rotulo: 'En tránsito', valor: enTransito, alerta: false },
      { rotulo: 'Doc. pendiente', valor: conPendientes, alerta: true },
      { rotulo: 'En despacho', valor: enDespacho, alerta: false },
      { rotulo: 'Finalizadas', valor: finalizadas, alerta: false }
    ];

    document.getElementById('indicadores').innerHTML = tarjetas.map(function (t) {
      return '<div class="indicador' + (t.alerta && t.valor > 0 ? ' alerta' : '') + '">' +
             '<div class="rotulo">' + t.rotulo + '</div>' +
             '<div class="valor">' + String(t.valor).padStart(2, '0') + '</div></div>';
    }).join('');
  }

  /* Muestra las cinco operaciones con arribo más próximo. */
  function dibujarUltimasOperaciones(lista) {
    const cuerpo = document.getElementById('cuerpo-tabla');

    if (lista.length === 0) {
      cuerpo.innerHTML = '<tr><td colspan="6" class="vacio">No hay operaciones registradas.</td></tr>';
      return;
    }

    const ordenadas = lista.slice().sort(function (a, b) {
      return b.fechaArribo.localeCompare(a.fechaArribo);
    }).slice(0, 5);

    cuerpo.innerHTML = ordenadas.map(function (op) {
      const avance = avanceDocumental(op);
      return '<tr>' +
        '<td><a href="detalle.html?numero=' + op.numero + '">' + op.numero + '</a></td>' +
        '<td>' + nombreImportador(op.importadorId) + '</td>' +
        '<td>' + nombreTransporte(op.transporte) + '</td>' +
        '<td>' + formatearFecha(op.fechaArribo) + '</td>' +
        '<td>' + avance.recibidos + ' / ' + avance.total + '</td>' +
        '<td>' + etiqueta(op.etapa, nombreEtapa(op.etapa)) + '</td>' +
        '</tr>';
    }).join('');
  }
});
