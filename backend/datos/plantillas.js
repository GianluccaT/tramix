// Documentos que se piden según el medio de transporte.
// El backend usa esto para armar el checklist cuando se registra una operación nueva
// (se guarda en la tabla documentos)

const plantillas = {
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

module.exports = plantillas;
