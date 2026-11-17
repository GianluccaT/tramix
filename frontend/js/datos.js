/* ============================================================
   TRAMIX · Datos simulados (Indicador 2)
   ------------------------------------------------------------
   En esta etapa no se utiliza backend ni base de datos. Toda la
   información se define en arreglos JavaScript y se conserva en
   el navegador mediante localStorage (ver almacenamiento.js).
   ============================================================ */

/* Catálogo de importadores */
const IMPORTADORES = [
  { id: 'IMP01', razonSocial: 'Distribuidora del Este S.A.' },
  { id: 'IMP02', razonSocial: 'Agroinsumos Paraguay S.R.L.' },
  { id: 'IMP03', razonSocial: 'Ferretería Central S.A.' },
  { id: 'IMP04', razonSocial: 'Tecno Import S.A.' },
  { id: 'IMP05', razonSocial: 'Textiles del Sur S.A.' }
];

/* Usuarios de demostración. La autenticación real se implementará
   en una etapa posterior; aquí solo se valida contra este arreglo. */
const USUARIOS = [
  { email: 'jgimenez@tramix.com.py',        clave: 'tramix123', nombre: 'J. Giménez',  rol: 'despachante',   importadorId: null },
  { email: 'compras@agroinsumos.com.py',    clave: 'tramix123', nombre: 'L. Ayala',    rol: 'importador',    importadorId: 'IMP02' },
  { email: 'admin@tramix.com.py',           clave: 'tramix123', nombre: 'M. Duarte',   rol: 'administrador', importadorId: null }
];

/* Etapas de la operación (RF06) */
const ETAPAS = [
  { id: 'registrada',    nombre: 'Registrada' },
  { id: 'en_transito',   nombre: 'En tránsito' },
  { id: 'doc_completa',  nombre: 'Doc. completa' },
  { id: 'en_despacho',   nombre: 'En despacho' },
  { id: 'finalizada',    nombre: 'Finalizada' }
];

/* Medios de transporte disponibles */
const TRANSPORTES = [
  { id: 'maritimo',  nombre: 'Marítimo' },
  { id: 'terrestre', nombre: 'Terrestre' },
  { id: 'aereo',     nombre: 'Aéreo' }
];

/* Plantillas del checklist documental por medio de transporte (RF04).
   Corrige la observación del Indicador 1: el conocimiento de embarque
   corresponde al transporte marítimo, la carta de porte (CRT) al
   terrestre y la guía aérea (AWB) al aéreo. */
const PLANTILLAS_CHECKLIST = {
  maritimo: [
    'Factura comercial',
    'Conocimiento de embarque (B/L)',
    'Packing list',
    'Certificado de origen',
    'Póliza de seguro'
  ],
  terrestre: [
    'Factura comercial',
    'Carta de porte internacional (CRT)',
    'Packing list',
    'Certificado de origen',
    'Manifiesto internacional de carga (MIC/DTA)'
  ],
  aereo: [
    'Factura comercial',
    'Guía aérea (AWB)',
    'Packing list',
    'Certificado de origen'
  ]
};

/* Operaciones de importación de ejemplo */
const OPERACIONES_INICIALES = [
  {
    numero: 'IMP-2026-041',
    importadorId: 'IMP01',
    proveedor: 'Ningbo Tools Co. Ltd.',
    paisOrigen: 'China',
    transporte: 'maritimo',
    fechaArribo: '2026-09-02',
    descripcion: 'Herramientas manuales — 1 contenedor de 20 pies.',
    etapa: 'en_despacho',
    documentos: [
      { tipo: 'Factura comercial',            estado: 'recibido', archivo: 'factura_041.pdf' },
      { tipo: 'Conocimiento de embarque (B/L)', estado: 'recibido', archivo: 'bl_041.pdf' },
      { tipo: 'Packing list',                 estado: 'recibido', archivo: 'packing_041.pdf' },
      { tipo: 'Certificado de origen',        estado: 'recibido', archivo: 'origen_041.pdf' },
      { tipo: 'Póliza de seguro',             estado: 'recibido', archivo: 'poliza_041.pdf' }
    ],
    historial: [
      { fecha: '2026-08-12', usuario: 'J. Giménez', texto: 'Operación registrada.' },
      { fecha: '2026-08-20', usuario: 'J. Giménez', texto: 'Etapa actualizada a En tránsito.' },
      { fecha: '2026-08-29', usuario: 'J. Giménez', texto: 'Etapa actualizada a Doc. completa.' },
      { fecha: '2026-09-01', usuario: 'J. Giménez', texto: 'Etapa actualizada a En despacho.' }
    ]
  },
  {
    numero: 'IMP-2026-040',
    importadorId: 'IMP02',
    proveedor: 'Rosario Agro S.A.',
    paisOrigen: 'Argentina',
    transporte: 'terrestre',
    fechaArribo: '2026-09-05',
    descripcion: 'Fertilizantes granulados — 28 toneladas.',
    etapa: 'en_transito',
    documentos: [
      { tipo: 'Factura comercial',                        estado: 'recibido',  archivo: 'factura_040.pdf' },
      { tipo: 'Carta de porte internacional (CRT)',       estado: 'recibido',  archivo: 'crt_040.pdf' },
      { tipo: 'Packing list',                             estado: 'observado', archivo: 'packing_040.pdf' },
      { tipo: 'Certificado de origen',                    estado: 'pendiente', archivo: null },
      { tipo: 'Manifiesto internacional de carga (MIC/DTA)', estado: 'pendiente', archivo: null }
    ],
    historial: [
      { fecha: '2026-08-15', usuario: 'J. Giménez', texto: 'Operación registrada.' },
      { fecha: '2026-08-18', usuario: 'L. Ayala',   texto: 'Documento adjuntado: Factura comercial.' },
      { fecha: '2026-08-19', usuario: 'J. Giménez', texto: 'Packing list marcado como observado.' },
      { fecha: '2026-08-20', usuario: 'J. Giménez', texto: 'Etapa actualizada a En tránsito.' }
    ]
  },
  {
    numero: 'IMP-2026-039',
    importadorId: 'IMP03',
    proveedor: 'Iberia Hierros S.L.',
    paisOrigen: 'España',
    transporte: 'maritimo',
    fechaArribo: '2026-08-24',
    descripcion: 'Perfiles de acero — 2 contenedores de 40 pies.',
    etapa: 'finalizada',
    documentos: [
      { tipo: 'Factura comercial',              estado: 'recibido', archivo: 'factura_039.pdf' },
      { tipo: 'Conocimiento de embarque (B/L)', estado: 'recibido', archivo: 'bl_039.pdf' },
      { tipo: 'Packing list',                   estado: 'recibido', archivo: 'packing_039.pdf' },
      { tipo: 'Certificado de origen',          estado: 'recibido', archivo: 'origen_039.pdf' },
      { tipo: 'Póliza de seguro',               estado: 'recibido', archivo: 'poliza_039.pdf' }
    ],
    historial: [
      { fecha: '2026-08-01', usuario: 'J. Giménez', texto: 'Operación registrada.' },
      { fecha: '2026-08-24', usuario: 'J. Giménez', texto: 'Etapa actualizada a Finalizada.' }
    ]
  },
  {
    numero: 'IMP-2026-038',
    importadorId: 'IMP04',
    proveedor: 'Miami Electronics Corp.',
    paisOrigen: 'Estados Unidos',
    transporte: 'aereo',
    fechaArribo: '2026-09-11',
    descripcion: 'Equipos informáticos — 12 bultos.',
    etapa: 'registrada',
    documentos: [
      { tipo: 'Factura comercial',     estado: 'recibido',  archivo: 'factura_038.pdf' },
      { tipo: 'Guía aérea (AWB)',      estado: 'recibido',  archivo: 'awb_038.pdf' },
      { tipo: 'Packing list',          estado: 'pendiente', archivo: null },
      { tipo: 'Certificado de origen', estado: 'pendiente', archivo: null }
    ],
    historial: [
      { fecha: '2026-08-28', usuario: 'J. Giménez', texto: 'Operación registrada.' }
    ]
  },
  {
    numero: 'IMP-2026-037',
    importadorId: 'IMP05',
    proveedor: 'Textil Andina Ltda.',
    paisOrigen: 'Perú',
    transporte: 'maritimo',
    fechaArribo: '2026-09-08',
    descripcion: 'Tejidos de algodón — 1 contenedor de 40 pies.',
    etapa: 'doc_completa',
    documentos: [
      { tipo: 'Factura comercial',              estado: 'recibido', archivo: 'factura_037.pdf' },
      { tipo: 'Conocimiento de embarque (B/L)', estado: 'recibido', archivo: 'bl_037.pdf' },
      { tipo: 'Packing list',                   estado: 'recibido', archivo: 'packing_037.pdf' },
      { tipo: 'Certificado de origen',          estado: 'recibido', archivo: 'origen_037.pdf' },
      { tipo: 'Póliza de seguro',               estado: 'recibido', archivo: 'poliza_037.pdf' }
    ],
    historial: [
      { fecha: '2026-08-10', usuario: 'J. Giménez', texto: 'Operación registrada.' },
      { fecha: '2026-08-22', usuario: 'J. Giménez', texto: 'Etapa actualizada a En tránsito.' },
      { fecha: '2026-08-30', usuario: 'J. Giménez', texto: 'Etapa actualizada a Doc. completa.' }
    ]
  },
  {
    numero: 'IMP-2026-036',
    importadorId: 'IMP02',
    proveedor: 'Bío Semillas S.A.',
    paisOrigen: 'Brasil',
    transporte: 'terrestre',
    fechaArribo: '2026-09-18',
    descripcion: 'Semillas de soja certificada — 15 toneladas.',
    etapa: 'registrada',
    documentos: [
      { tipo: 'Factura comercial',                          estado: 'recibido',  archivo: 'factura_036.pdf' },
      { tipo: 'Carta de porte internacional (CRT)',         estado: 'pendiente', archivo: null },
      { tipo: 'Packing list',                               estado: 'pendiente', archivo: null },
      { tipo: 'Certificado de origen',                      estado: 'pendiente', archivo: null },
      { tipo: 'Manifiesto internacional de carga (MIC/DTA)', estado: 'pendiente', archivo: null }
    ],
    historial: [
      { fecha: '2026-08-31', usuario: 'J. Giménez', texto: 'Operación registrada.' }
    ]
  }
];
