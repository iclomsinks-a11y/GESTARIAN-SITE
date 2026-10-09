/**
 * Interconexión de la Red Empresarial B2B GESTARIAN
 * Plataforma para compartir demanda y oferta de bienes y servicios entre empresas.
 * Exclusivo para suscriptores de GESTARIAN ENTERPRISE.
 */

export interface DemandaOfertaEmpresarial {
  id: string;
  tipo: 'DEMANDA' | 'OFERTA';
  titulo: string;
  categoria: 'MECANICA_VEHICULOS' | 'RECAMBIOS_SUMINISTROS' | 'LOGISTICA_TRANSPORTE' | 'PERITAJE_HOMOLOGACION' | 'SERVICIOS_PROFESIONALES';
  descripcion: string;
  empresaEmisora: string;
  cif: string;
  ubicacion: string;
  presupuestoEstimado: string;
  fechaPublicacion: string;
  urgencia: 'ALTA' | 'MEDIA' | 'ESTANDAR';
  contacto: string;
  estado: 'ACTIVA' | 'CONECTADA' | 'COMPLETADA';
}

export const DEMANDAS_RED_EMPRESARIAL_MOCK: DemandaOfertaEmpresarial[] = [
  {
    id: 'RED-DEM-2026-001',
    tipo: 'DEMANDA',
    titulo: 'Subcontratación Chapa y Pintura para 15 Vehículos Comerciales',
    categoria: 'MECANICA_VEHICULOS',
    descripcion: 'Buscamos taller colaborador con cabina de pintura homologada para flota de furgonetas de reparto en Madrid Corredor del Henares. Garantía de volumen mensual.',
    empresaEmisora: 'Transportes Marítimos Gómez S.L.',
    cif: 'B11223344',
    ubicacion: 'San Fernando de Henares (Madrid)',
    presupuestoEstimado: '14.500 € / mes',
    fechaPublicacion: '2026-10-06',
    urgencia: 'ALTA',
    contacto: 'operaciones@transgomez.es',
    estado: 'ACTIVA'
  },
  {
    id: 'RED-DEM-2026-002',
    tipo: 'DEMANDA',
    titulo: 'Compra por Lote: 50 Baterías Start-Stop AGM 12V 70Ah',
    categoria: 'RECAMBIOS_SUMINISTROS',
    descripcion: 'Necesitamos suministro directo de proveedor homologado con entrega en 48 horas. Pago garantizado vía remesa SEPA B2B.',
    empresaEmisora: 'DM CAR TALLER MECÁNICO S.L.',
    cif: 'B12345678',
    ubicacion: 'Madrid Sur',
    presupuestoEstimado: '4.800 €',
    fechaPublicacion: '2026-10-07',
    urgencia: 'ALTA',
    contacto: 'recambios@dmcar-taller.es',
    estado: 'ACTIVA'
  },
  {
    id: 'RED-OFR-2026-003',
    tipo: 'OFERTA',
    titulo: 'Capacidad Disponible: Bancada Láser y Diagnosis Electrónica',
    categoria: 'MECANICA_VEHICULOS',
    descripcion: 'Disponibilidad de bancada de tiro universal y equipos Bosch KTS en turno de tarde (15:00 a 21:00) para talleres que requieran calibración ADAS.',
    empresaEmisora: 'Talleres y Logística Ibérica S.L.',
    cif: 'B98765432',
    ubicacion: 'Getafe (Madrid)',
    presupuestoEstimado: 'Tarifa conveniada 45 €/h',
    fechaPublicacion: '2026-10-05',
    urgencia: 'MEDIA',
    contacto: 'taller@talleresiberica.es',
    estado: 'ACTIVA'
  },
  {
    id: 'RED-DEM-2026-004',
    tipo: 'DEMANDA',
    titulo: 'Servicio de Grúa y Plataforma Portavehículos Nocturna',
    categoria: 'LOGISTICA_TRANSPORTE',
    descripcion: 'Requerimos asistencia de rescate y traslado de turismos y furgonetas ligeras en horario de 22:00 a 06:00 horas.',
    empresaEmisora: 'Asistencia y Flotas del Centro S.L.',
    cif: 'B28192837',
    ubicacion: 'Comunidad de Madrid',
    presupuestoEstimado: 'Bolsa fija mensual 3.200 €',
    fechaPublicacion: '2026-10-04',
    urgencia: 'MEDIA',
    contacto: 'flotas@asistenciacentro.es',
    estado: 'ACTIVA'
  }
];
