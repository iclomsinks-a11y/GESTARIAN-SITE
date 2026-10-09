/**
 * Motor de Cálculo de Nóminas y Seguridad Social España 2026
 * Fuentes Oficiales:
 * - Orden PJC/297/2026 (desarrollo de normas legales de cotización BOE-A-2026-7296)
 * - Guía Oficial de Cotización TGSS
 * - Base máxima general: 5.101,20 €/mes (170,04 €/día)
 */

import { GrupoCotizacionInfo, Empleado, NominaCalculada, BorradorModelo111, BorradorModelo190 } from './types';

// Tablas Oficiales 2026 de los 11 Grupos de Cotización de la Seguridad Social
export const GRUPOS_COTIZACION_2026: Record<number, GrupoCotizacionInfo> = {
  1: {
    grupo: 1,
    categoria: 'Ingenieros y Licenciados. Personal de alta dirección',
    tipoCotizacion: 'MENSUAL',
    baseMinimaMesOdia: 1989.30,
    baseMaximaMesOdia: 5101.20
  },
  2: {
    grupo: 2,
    categoria: 'Ingenieros Técnicos, Peritos y Ayudantes Titulados',
    tipoCotizacion: 'MENSUAL',
    baseMinimaMesOdia: 1649.70,
    baseMaximaMesOdia: 5101.20
  },
  3: {
    grupo: 3,
    categoria: 'Jefes Administrativos y de Taller',
    tipoCotizacion: 'MENSUAL',
    baseMinimaMesOdia: 1435.20,
    baseMaximaMesOdia: 5101.20
  },
  4: {
    grupo: 4,
    categoria: 'Ayudantes no Titulados',
    tipoCotizacion: 'MENSUAL',
    baseMinimaMesOdia: 1424.40,
    baseMaximaMesOdia: 5101.20
  },
  5: {
    grupo: 5,
    categoria: 'Oficiales Administrativos',
    tipoCotizacion: 'MENSUAL',
    baseMinimaMesOdia: 1424.40,
    baseMaximaMesOdia: 5101.20
  },
  6: {
    grupo: 6,
    categoria: 'Subalternos',
    tipoCotizacion: 'MENSUAL',
    baseMinimaMesOdia: 1424.40,
    baseMaximaMesOdia: 5101.20
  },
  7: {
    grupo: 7,
    categoria: 'Auxiliares Administrativos',
    tipoCotizacion: 'MENSUAL',
    baseMinimaMesOdia: 1424.40,
    baseMaximaMesOdia: 5101.20
  },
  8: {
    grupo: 8,
    categoria: 'Oficiales de primera y segunda',
    tipoCotizacion: 'DIARIA',
    baseMinimaMesOdia: 47.48, // 1.424,40 / 30 días
    baseMaximaMesOdia: 170.04 // 5.101,20 / 30 días
  },
  9: {
    grupo: 9,
    categoria: 'Oficiales de tercera y Especialistas',
    tipoCotizacion: 'DIARIA',
    baseMinimaMesOdia: 47.48,
    baseMaximaMesOdia: 170.04
  },
  10: {
    grupo: 10,
    categoria: 'Peones',
    tipoCotizacion: 'DIARIA',
    baseMinimaMesOdia: 47.48,
    baseMaximaMesOdia: 170.04
  },
  11: {
    grupo: 11,
    categoria: 'Trabajadores menores de 18 años (independientemente de categoría)',
    tipoCotizacion: 'DIARIA',
    baseMinimaMesOdia: 47.48,
    baseMaximaMesOdia: 170.04
  }
};

/**
 * Calcula la nómina detallada de un empleado para un mes específico.
 */
export function calcularNomina(empleado: Empleado, periodoMes: string = '2026-10'): NominaCalculada {
  const gInfo = GRUPOS_COTIZACION_2026[empleado.grupoCotizacion] || GRUPOS_COTIZACION_2026[7];

  // Devengos salariales
  const salarioBase = empleado.salarioBaseMensual;
  const complementos = empleado.complementosSalariales;
  const prorrataPagas = empleado.prorrateoPagasExtras ? Number(((salarioBase + complementos) / 6).toFixed(2)) : 0;
  const totalSalarial = Number((salarioBase + complementos + prorrataPagas).toFixed(2));

  // Devengos no salariales
  const dietasYTransporte = empleado.devengosNoSalariales;
  const totalNoSalarial = dietasYTransporte;

  const totalDevengadoBruto = Number((totalSalarial + totalNoSalarial).toFixed(2));

  // Base de cotización contingencias comunes (BCCC):
  // Salario computable + prorrata de pagas extras (con límites mínimo y máximo según grupo de cotización)
  let baseCalculadaCC = totalSalarial;
  const baseMinMes = gInfo.tipoCotizacion === 'DIARIA' ? gInfo.baseMinimaMesOdia * 30 : gInfo.baseMinimaMesOdia;
  const baseMaxMes = gInfo.tipoCotizacion === 'DIARIA' ? gInfo.baseMaximaMesOdia * 30 : gInfo.baseMaximaMesOdia;

  const baseCotizacionCC = Number(Math.max(baseMinMes, Math.min(baseMaxMes, baseCalculadaCC)).toFixed(2));
  const baseCotizacionCP = baseCotizacionCC; // Contingencias Profesionales
  const baseSujetaIrpf = Number((salarioBase + complementos + prorrataPagas).toFixed(2));

  // Aportaciones del Trabajador (2026):
  // - Contingencias comunes: 4.70%
  // - Desempleo: 1.55% (indefinido) o 1.60% (temporal)
  // - Formación Profesional: 0.10%
  // - MEI: 0.14%
  const esTemporal = empleado.tipoContrato === 'TEMPORAL';
  const tipoDesempleoTrabajador = esTemporal ? 0.0160 : 0.0155;

  const dedCC = Number((baseCotizacionCC * 0.0470).toFixed(2));
  const dedDesempleo = Number((baseCotizacionCP * tipoDesempleoTrabajador).toFixed(2));
  const dedFP = Number((baseCotizacionCP * 0.0010).toFixed(2));
  const dedMei = Number((baseCotizacionCC * 0.0014).toFixed(2));
  const totalAportacionSS = Number((dedCC + dedDesempleo + dedFP + dedMei).toFixed(2));

  // Retención IRPF del trabajador
  const retencionIrpf = Number((baseSujetaIrpf * (empleado.porcentajeIrpf / 100)).toFixed(2));
  const totalDeducciones = Number((totalAportacionSS + retencionIrpf).toFixed(2));

  // Sueldo Neto (Líquido a percibir)
  const liquidoTotalAPercibir = Number((totalDevengadoBruto - totalDeducciones).toFixed(2));

  // Costes de la Empresa (2026):
  // - Contingencias comunes: 23.60%
  // - Desempleo: 5.50% (indefinido) o 6.70% (temporal)
  // - FOGASA: 0.20%
  // - Formación profesional: 0.60%
  // - MEI Empresa: 0.58%
  // - AT/EP (CNAE): aproximado 3.35% (1.85% IT + 1.50% IMS)
  const tipoDesempleoEmpresa = esTemporal ? 0.0670 : 0.0550;
  const costCC = Number((baseCotizacionCC * 0.2360).toFixed(2));
  const costDesempleo = Number((baseCotizacionCP * tipoDesempleoEmpresa).toFixed(2));
  const costFogasa = Number((baseCotizacionCP * 0.0020).toFixed(2));
  const costFP = Number((baseCotizacionCP * 0.0060).toFixed(2));
  const costMei = Number((baseCotizacionCC * 0.0058).toFixed(2));
  const costAtEp = Number((baseCotizacionCP * 0.0335).toFixed(2));

  const totalSeguridadSocialEmpresa = Number(
    (costCC + costDesempleo + costFogasa + costFP + costMei + costAtEp).toFixed(2)
  );

  const costeTotalEmpresa = Number((totalDevengadoBruto + totalSeguridadSocialEmpresa).toFixed(2));

  return {
    id: `NOM-${empleado.id}-${periodoMes}`,
    empleadoId: empleado.id,
    empleadoNombre: `${empleado.nombre} ${empleado.apellidos}`,
    empleadoNif: empleado.nif,
    periodoMes,
    grupoCotizacion: empleado.grupoCotizacion,
    devengosSalariales: {
      salarioBase,
      complementos,
      prorrataPagas,
      totalSalarial
    },
    devengosNoSalariales: {
      dietasYTransporte,
      totalNoSalarial
    },
    totalDevengadoBruto,
    baseCotizacionContingenciasComunes: baseCotizacionCC,
    baseCotizacionContingenciasProfesionales: baseCotizacionCP,
    baseSujetaIrpf,
    deduccionesTrabajador: {
      contingenciasComunes: dedCC,
      desempleo: dedDesempleo,
      formacionProfesional: dedFP,
      mei: dedMei,
      totalAportacionSeguridadSocial: totalAportacionSS,
      retencionIrpf,
      totalDeducciones
    },
    liquidoTotalAPercibir,
    costeSeguridadSocialEmpresa: {
      contingenciasComunesEmpresa: costCC,
      desempleoEmpresa: costDesempleo,
      fogasaEmpresa: costFogasa,
      formacionProfesionalEmpresa: costFP,
      meiEmpresa: costMei,
      accidentesTrabajoYEnfermedades: costAtEp,
      totalSeguridadSocialEmpresa
    },
    costeTotalEmpresa
  };
}

/**
 * Autorellena el borrador oficial del Modelo 111 (Retenciones IRPF del Trabajo)
 * a partir de la lista de nóminas calculadas del trimestre.
 */
export function generarBorradorModelo111(
  ejercicio: number,
  periodo: '1T' | '2T' | '3T' | '4T',
  nominas: NominaCalculada[]
): BorradorModelo111 {
  const perceptoresUnicos = new Set(nominas.map(n => n.empleadoNif)).size;
  let totalPercepciones = 0;
  let totalRetenciones = 0;

  for (const nom of nominas) {
    totalPercepciones += nom.totalDevengadoBruto;
    totalRetenciones += nom.deduccionesTrabajador.retencionIrpf;
  }

  totalPercepciones = Number(totalPercepciones.toFixed(2));
  totalRetenciones = Number(totalRetenciones.toFixed(2));

  return {
    ejercicio,
    periodo,
    casilla_01_numero_perceptores: perceptoresUnicos,
    casilla_02_importe_percepciones: totalPercepciones,
    casilla_03_importe_retenciones: totalRetenciones,
    casilla_28_total_liquidar: totalRetenciones
  };
}

/**
 * Autorellena el borrador oficial del Modelo 190 (Resumen Anual de Retenciones de Trabajo).
 */
export function generarBorradorModelo190(
  ejercicio: number,
  nominasAnuales: NominaCalculada[]
): BorradorModelo190 {
  const mapaPorNif = new Map<string, { nif: string; nombre: string; percepcion: number; retencion: number }>();

  for (const n of nominasAnuales) {
    const existing = mapaPorNif.get(n.empleadoNif) || {
      nif: n.empleadoNif,
      nombre: n.empleadoNombre,
      percepcion: 0,
      retencion: 0
    };
    existing.percepcion += n.totalDevengadoBruto;
    existing.retencion += n.deduccionesTrabajador.retencionIrpf;
    mapaPorNif.set(n.empleadoNif, existing);
  }

  const registros = Array.from(mapaPorNif.values()).map(r => ({
    nif: r.nif,
    nombre: r.nombre,
    percepcionIntegra: Number(r.percepcion.toFixed(2)),
    retencionPracticada: Number(r.retencion.toFixed(2))
  }));

  const totalPercepciones = Number(registros.reduce((acc, r) => acc + r.percepcionIntegra, 0).toFixed(2));
  const totalRetenciones = Number(registros.reduce((acc, r) => acc + r.retencionPracticada, 0).toFixed(2));

  return {
    ejercicio,
    totalPerceptores: registros.length,
    totalPercepciones,
    totalRetenciones,
    registrosPerceptores: registros
  };
}
