import { ActivoPropiedad, InmuebleArrendado } from './types';

export const ACTIVOS_PROPIEDAD_MOCK: ActivoPropiedad[] = [
  {
    id: 'ACT-001',
    codigoInterno: 'MAQ-2024-01',
    nombre: 'Elevador Electrohidráulico 4 Columnas 5T',
    categoria: 'MAQUINARIA',
    fechaAdquisicion: '2024-03-15',
    valorAdquisicion: 14500.00,
    coeficienteAmortizacionAnual: 12.0, // Coeficiente oficial lineal AEAT (máx 12% / 18 años)
    periodoMaximoAnos: 18,
    amortizacionAcumulada: 3770.00,
    cuotaAnual: 1740.00,
    valorNetoContable: 10730.00
  },
  {
    id: 'ACT-002',
    codigoInterno: 'DIAG-2025-04',
    nombre: 'Estación Central de Diagnosis Multimarca y Osciloscopio',
    categoria: 'MAQUINARIA',
    fechaAdquisicion: '2025-01-10',
    valorAdquisicion: 6800.00,
    coeficienteAmortizacionAnual: 12.0,
    periodoMaximoAnos: 18,
    amortizacionAcumulada: 1428.00,
    cuotaAnual: 816.00,
    valorNetoContable: 5372.00
  },
  {
    id: 'ACT-003',
    codigoInterno: 'IT-2025-09',
    nombre: 'Servidor Local y Terminales de Recepción Taller',
    categoria: 'EQUIPO_INFORMATICO',
    fechaAdquisicion: '2025-06-01',
    valorAdquisicion: 3200.00,
    coeficienteAmortizacionAnual: 25.0, // Coeficiente oficial lineal AEAT (máx 25% / 8 años)
    periodoMaximoAnos: 8,
    amortizacionAcumulada: 1066.67,
    cuotaAnual: 800.00,
    valorNetoContable: 2133.33
  }
];

export const INMUEBLES_ARRENDADOS_MOCK: InmuebleArrendado[] = [
  {
    id: 'INM-001',
    nombreLocal: 'Nave Central Taller Mecánico DM Car',
    direccionCompleta: 'Calle Metalurgia 18, Polígono Industrial San Fernando, 28830 Madrid',
    referenciaCatastral: '9872023VH5797S0001WX', // Referencia Catastral oficial exigida por Modelo 180
    arrendador: {
      razonSocial: 'Inmobiliaria y Naves Industriales del Centro S.L.',
      nifCif: 'B83492811',
      email: 'arrendamientos@navescentro.es'
    },
    baseImponibleMensual: 2500.00,
    porcentajeRetencionIrpf: 19.0, // 19% legal obligatorio
    porcentajeIva: 21.0,
    retencionMensual: 475.00, // 2500 * 0.19
    cuotaIvaMensual: 525.00, // 2500 * 0.21
    totalFacturaPagarMensual: 2550.00, // 2500 + 525 - 475
    fechaContratoInicio: '2023-01-01',
    fechaProximaRevisionRentaIpc: '2026-11-01'
  }
];
