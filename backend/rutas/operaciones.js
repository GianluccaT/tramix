// Endpoints del recurso "operaciones"
// Desde el Indicador 5 ya no usamos el arreglo en memoria, todo se lee y se guarda en MySQL

const express = require('express');
const conexion = require('../conexion');
const plantillas = require('../datos/plantillas');

const router = express.Router();

// GET /api/operaciones
// Trae las operaciones de la base con su checklist de documentos. Lo usa la pantalla P3
router.get('/', async (req, res) => {
  try {
    const [operaciones] = await conexion.query(
      'SELECT * FROM operaciones ORDER BY numero DESC'
    );
    const [documentos] = await conexion.query(
      'SELECT * FROM documentos ORDER BY id'
    );

    // armamos el mismo JSON que devolvíamos antes, así el frontend no se entera del cambio
    const respuesta = operaciones.map(op => {
      return {
        numero: op.numero,
        importadorId: op.importador_id,
        proveedor: op.proveedor,
        paisOrigen: op.pais_origen,
        transporte: op.transporte,
        fechaArribo: op.fecha_arribo,
        descripcion: op.descripcion,
        etapa: op.etapa,
        documentos: documentos
          .filter(doc => doc.operacion_numero === op.numero)
          .map(doc => ({ tipo: doc.tipo, estado: doc.estado, archivo: doc.archivo }))
      };
    });

    res.status(200).json(respuesta);
  } catch (error) {
    console.error('Error en GET /api/operaciones:', error.message);
    res.status(500).json({ error: 'No se pudieron consultar las operaciones' });
  }
});

// POST /api/operaciones
// Registra una operación nueva y su checklist en la base. Recibe los datos del formulario de P4
router.post('/', async (req, res) => {
  const datos = req.body || {};

  // las mismas validaciones del Indicador 4
  // 1) que vengan todos los campos obligatorios, si falta alguno devolvemos 400 y avisamos cuál
  const obligatorios = ['numero', 'importadorId', 'proveedor', 'paisOrigen', 'transporte', 'fechaArribo', 'descripcion'];
  const faltantes = obligatorios.filter(campo => !datos[campo] || String(datos[campo]).trim() === '');

  if (faltantes.length > 0) {
    return res.status(400).json({
      error: 'Faltan datos obligatorios',
      campos: faltantes
    });
  }

  // 2) el transporte tiene que ser uno de los tres, porque de eso depende el checklist
  if (!plantillas[datos.transporte]) {
    return res.status(400).json({
      error: 'Medio de transporte no válido. Usar: maritimo, terrestre o aereo'
    });
  }

  try {
    // 3) no pueden existir dos operaciones con el mismo número (ahora lo preguntamos a la base)
    const [repetidas] = await conexion.query(
      'SELECT numero FROM operaciones WHERE numero = ?', [datos.numero]
    );
    if (repetidas.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una operación con el número ' + datos.numero
      });
    }

    // 4) el importador tiene que existir en la tabla importadores
    const [importador] = await conexion.query(
      'SELECT id FROM importadores WHERE id = ?', [datos.importadorId]
    );
    if (importador.length === 0) {
      return res.status(400).json({
        error: 'El importador ' + datos.importadorId + ' no existe'
      });
    }
  } catch (error) {
    console.error('Error en POST /api/operaciones:', error.message);
    return res.status(500).json({ error: 'No se pudo registrar la operación' });
  }

  // la operación y sus documentos se guardan juntos: si algo falla no queda nada a medias
  const documentos = plantillas[datos.transporte];
  const cx = await conexion.getConnection();

  try {
    await cx.beginTransaction();

    // los ? los reemplaza mysql2 con los valores, así no armamos el SQL concatenando texto
    await cx.query(
      'INSERT INTO operaciones (numero, importador_id, proveedor, pais_origen, transporte, fecha_arribo, descripcion, etapa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [datos.numero, datos.importadorId, datos.proveedor, datos.paisOrigen, datos.transporte, datos.fechaArribo, datos.descripcion, 'registrada']
    );

    for (const tipo of documentos) {
      await cx.query(
        'INSERT INTO documentos (operacion_numero, tipo, estado) VALUES (?, ?, ?)',
        [datos.numero, tipo, 'pendiente']
      );
    }

    await cx.commit();
  } catch (error) {
    await cx.rollback();
    console.error('Error en POST /api/operaciones:', error.message);
    return res.status(500).json({ error: 'No se pudo registrar la operación' });
  } finally {
    cx.release();
  }

  // devolvemos la operación tal cual quedó guardada
  res.status(201).json({
    numero: datos.numero,
    importadorId: datos.importadorId,
    proveedor: datos.proveedor,
    paisOrigen: datos.paisOrigen,
    transporte: datos.transporte,
    fechaArribo: datos.fechaArribo,
    descripcion: datos.descripcion,
    etapa: 'registrada',
    documentos: documentos.map(tipo => ({ tipo: tipo, estado: 'pendiente', archivo: null }))
  });
});

module.exports = router;
