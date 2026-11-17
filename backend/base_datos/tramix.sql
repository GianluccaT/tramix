-- Base de datos de TRAMIX
-- Para crearla: npm run db:init (o a mano: mysql -u root -p < base_datos/tramix.sql)
-- Ojo: si ya existían las tablas las borra y las vuelve a crear con los datos de ejemplo

CREATE DATABASE IF NOT EXISTS tramix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tramix;

-- para que los acentos se guarden bien
SET NAMES utf8mb4;

DROP TABLE IF EXISTS documentos;
DROP TABLE IF EXISTS operaciones;
DROP TABLE IF EXISTS importadores;

-- empresas que importan (las que antes estaban en el arreglo IMPORTADORES del frontend)
CREATE TABLE importadores (
  id            VARCHAR(10)  NOT NULL,
  razon_social  VARCHAR(150) NOT NULL,
  PRIMARY KEY (id)
);

-- el recurso principal: cada operación de importación pertenece a un importador
CREATE TABLE operaciones (
  numero         VARCHAR(20)  NOT NULL,
  importador_id  VARCHAR(10)  NOT NULL,
  proveedor      VARCHAR(150) NOT NULL,
  pais_origen    VARCHAR(80)  NOT NULL,
  transporte     ENUM('maritimo', 'terrestre', 'aereo') NOT NULL,
  fecha_arribo   DATE         NOT NULL,
  descripcion    VARCHAR(255) NOT NULL,
  etapa          ENUM('registrada', 'en_transito', 'doc_completa', 'en_despacho', 'finalizada') NOT NULL DEFAULT 'registrada',
  PRIMARY KEY (numero),
  FOREIGN KEY (importador_id) REFERENCES importadores (id)
);

-- el checklist: cada documento pertenece a una operación
CREATE TABLE documentos (
  id                INT          NOT NULL AUTO_INCREMENT,
  operacion_numero  VARCHAR(20)  NOT NULL,
  tipo              VARCHAR(100) NOT NULL,
  estado            ENUM('pendiente', 'recibido', 'observado') NOT NULL DEFAULT 'pendiente',
  archivo           VARCHAR(255) NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (operacion_numero) REFERENCES operaciones (numero)
);

-- datos de ejemplo, los mismos que veníamos usando en el MVP
INSERT INTO importadores (id, razon_social) VALUES
  ('IMP01', 'Distribuidora del Este S.A.'),
  ('IMP02', 'Agroinsumos Paraguay S.R.L.'),
  ('IMP03', 'Ferretería Central S.A.'),
  ('IMP04', 'Tecno Import S.A.'),
  ('IMP05', 'Textiles del Sur S.A.');

INSERT INTO operaciones (numero, importador_id, proveedor, pais_origen, transporte, fecha_arribo, descripcion, etapa) VALUES
  ('IMP-2026-036', 'IMP02', 'Bío Semillas S.A.', 'Brasil', 'terrestre', '2026-09-18', 'Semillas de soja certificada — 15 toneladas.', 'registrada'),
  ('IMP-2026-037', 'IMP05', 'Textil Andina Ltda.', 'Perú', 'maritimo', '2026-09-08', 'Tejidos de algodón — 1 contenedor de 40 pies.', 'doc_completa'),
  ('IMP-2026-038', 'IMP04', 'Miami Electronics Corp.', 'Estados Unidos', 'aereo', '2026-09-11', 'Equipos informáticos — 12 bultos.', 'registrada'),
  ('IMP-2026-039', 'IMP03', 'Iberia Hierros S.L.', 'España', 'maritimo', '2026-08-24', 'Perfiles de acero — 2 contenedores de 40 pies.', 'finalizada'),
  ('IMP-2026-040', 'IMP02', 'Rosario Agro S.A.', 'Argentina', 'terrestre', '2026-09-05', 'Fertilizantes granulados — 28 toneladas.', 'en_transito'),
  ('IMP-2026-041', 'IMP01', 'Ningbo Tools Co. Ltd.', 'China', 'maritimo', '2026-09-02', 'Herramientas manuales — 1 contenedor de 20 pies.', 'en_despacho');

INSERT INTO documentos (operacion_numero, tipo, estado, archivo) VALUES
  ('IMP-2026-036', 'Factura comercial', 'recibido', 'factura_036.pdf'),
  ('IMP-2026-036', 'Carta de porte internacional (CRT)', 'pendiente', NULL),
  ('IMP-2026-036', 'Packing list', 'pendiente', NULL),
  ('IMP-2026-036', 'Certificado de origen', 'pendiente', NULL),
  ('IMP-2026-036', 'Manifiesto internacional de carga (MIC/DTA)', 'pendiente', NULL),
  ('IMP-2026-037', 'Factura comercial', 'recibido', 'factura_037.pdf'),
  ('IMP-2026-037', 'Conocimiento de embarque (B/L)', 'recibido', 'bl_037.pdf'),
  ('IMP-2026-037', 'Packing list', 'recibido', 'packing_037.pdf'),
  ('IMP-2026-037', 'Certificado de origen', 'recibido', 'origen_037.pdf'),
  ('IMP-2026-037', 'Póliza de seguro', 'recibido', 'poliza_037.pdf'),
  ('IMP-2026-038', 'Factura comercial', 'recibido', 'factura_038.pdf'),
  ('IMP-2026-038', 'Guía aérea (AWB)', 'recibido', 'awb_038.pdf'),
  ('IMP-2026-038', 'Packing list', 'pendiente', NULL),
  ('IMP-2026-038', 'Certificado de origen', 'pendiente', NULL),
  ('IMP-2026-039', 'Factura comercial', 'recibido', 'factura_039.pdf'),
  ('IMP-2026-039', 'Conocimiento de embarque (B/L)', 'recibido', 'bl_039.pdf'),
  ('IMP-2026-039', 'Packing list', 'recibido', 'packing_039.pdf'),
  ('IMP-2026-039', 'Certificado de origen', 'recibido', 'origen_039.pdf'),
  ('IMP-2026-039', 'Póliza de seguro', 'recibido', 'poliza_039.pdf'),
  ('IMP-2026-040', 'Factura comercial', 'recibido', 'factura_040.pdf'),
  ('IMP-2026-040', 'Carta de porte internacional (CRT)', 'recibido', 'crt_040.pdf'),
  ('IMP-2026-040', 'Packing list', 'observado', 'packing_040.pdf'),
  ('IMP-2026-040', 'Certificado de origen', 'pendiente', NULL),
  ('IMP-2026-040', 'Manifiesto internacional de carga (MIC/DTA)', 'pendiente', NULL),
  ('IMP-2026-041', 'Factura comercial', 'recibido', 'factura_041.pdf'),
  ('IMP-2026-041', 'Conocimiento de embarque (B/L)', 'recibido', 'bl_041.pdf'),
  ('IMP-2026-041', 'Packing list', 'recibido', 'packing_041.pdf'),
  ('IMP-2026-041', 'Certificado de origen', 'recibido', 'origen_041.pdf'),
  ('IMP-2026-041', 'Póliza de seguro', 'recibido', 'poliza_041.pdf');
