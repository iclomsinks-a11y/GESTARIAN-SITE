/**
 * Módulo Laboral y de Seguridad Social (España 2026)
 * Normativa: Orden PJC/297/2026, RD 723/2026, Ley General de la Seguridad Social
 */

export interface GrupoCotizacionInfo {
  grupo: number;
  categoria: string;
  tipoCotizacion: 'MENSUAL' | 'DIARIA';
  baseMinimaMesOdia: number;
  baseMaximaMesOdia: number;
}

export interface Empleado {
  id: string;
  nif: string;
  nombre: string;
  apellidos: string;
  email: string;
  grupoCotizacion: number; // 1 a 11
  puesto: string;
  cnaeEmpresa: string; // ej: 4520 Mantenimiento y reparación de vehículos de motor
  convenioColectivo: string;
  tipoContrato: 'INDEFINIDO' | 'TEMPORAL' | 'PRACTICAS' | 'FORMACION';
  fechaInicioContrato: string;
  fechaFinContrato?: string; // Para avisos SEPE
  periodoPruebaFin?: string; // Para avisos SEPE
  salarioBaseMensual: number;
  complementosSalariales: number;
  devengosNoSalariales: number; // dietas, transporte exento
  porcentajeIrpf: number; // Retención IRPF a cuenta
  prorrateoPagasExtras: boolean;
}

export interface NominaCalculada {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  empleadoNif: string;
  periodoMes: string; // '2026-10'
  grupoCotizacion: number;

  // I. Devengos
  devengosSalariales: {
    salarioBase: number;
    complementos: number;
    prorrataPagas: number;
    totalSalarial: number;
  };
  devengosNoSalariales: {
    dietasYTransporte: number;
    totalNoSalarial: number;
  };
  totalDevengadoBruto: number;

  // Bases de Cotización
  baseCotizacionContingenciasComunes: number; // Limitada entre mín y máx 2026
  baseCotizacionContingenciasProfesionales: number;
  baseSujetaIrpf: number;

  // II. Deducciones del Trabajador (Aportación a la SS e IRPF)
  deduccionesTrabajador: {
    contingenciasComunes: number; // 4.70%
    desempleo: number; // 1.55% indefinido o 1.60% temporal
    formacionProfesional: number; // 0.10%
    mei: number; // Mecanismo de Equidad Intergeneracional 0.14% (2026)
    totalAportacionSeguridadSocial: number;
    retencionIrpf: number; // % IRPF sobre base
    totalDeducciones: number;
  };

  // Líquido total a percibir (Sueldo Neto)
  liquidoTotalAPercibir: number;

  // III. Costes de la Empresa a la Seguridad Social
  costeSeguridadSocialEmpresa: {
    contingenciasComunesEmpresa: number; // 23.60%
    desempleoEmpresa: number; // 5.50% o 6.70%
    fogasaEmpresa: number; // 0.20%
    formacionProfesionalEmpresa: number; // 0.60%
    meiEmpresa: number; // 0.58% (2026)
    accidentesTrabajoYEnfermedades: number; // tarifa AT/EP según CNAE
    totalSeguridadSocialEmpresa: number;
  };

  // Coste total empresa de este trabajador
  costeTotalEmpresa: number;
}

export interface BorradorModelo111 {
  ejercicio: number;
  periodo: '1T' | '2T' | '3T' | '4T' | string;
  casilla_01_numero_perceptores: number;
  casilla_02_importe_percepciones: number; // Total bruto devengado
  casilla_03_importe_retenciones: number; // Total IRPF retenido
  casilla_28_total_liquidar: number;
}

export interface BorradorModelo190 {
  ejercicio: number;
  totalPerceptores: number;
  totalPercepciones: number;
  totalRetenciones: number;
  registrosPerceptores: Array<{
    nif: string;
    nombre: string;
    percepcionIntegra: number;
    retencionPracticada: number;
  }>;
}
