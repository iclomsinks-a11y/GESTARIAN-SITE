/**
 * Motor de Cálculo de Activos, Amortizaciones y Retenciones de Alquiler (Modelo 115/180)
 * Fuentes Oficiales: Tablas Oficiales de Amortización AEAT e Instrucciones Modelos 115 y 180
 */

import { ActivoPropiedad, InmuebleArrendado, BorradorModelo115, BorradorModelo180 } from './types';

/**
 * Calcula la amortización lineal y el valor contable actual de un activo.
 */
export function calcularAmortizacionActivo(
  activo: Omit<ActivoPropiedad, 'cuotaAnual' | 'valorNetoContable'>,
  fechaCierre: Date = new Date()
): ActivoPropiedad {
  const cuotaAnual = Number((activo.valorAdquisicion * (activo.coeficienteAmortizacionAnual / 100)).toFixed(2));
  
  const fAdq = new Date(activo.fechaAdquisicion);
  const diffAnos = Math.max(0, (fechaCierre.getTime() - fAdq.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  
  const amortizacionEstimada = Number(Math.min(activo.valorAdquisicion, cuotaAnual * diffAnos).toFixed(2));
  const amortAcumulada = Math.max(activo.amortizacionAcumulada, amortizacionEstimada);
  const vnc = Number(Math.max(0, activo.valorAdquisicion - amortAcumulada).toFixed(2));

  return {
    ...activo,
    cuotaAnual,
    amortizacionAcumulada: amortAcumulada,
    valorNetoContable: vnc
  };
}

/**
 * Calcula el desglose fiscal de una factura mensual de arrendamiento comercial.
 * Exige estrictamente el 19% de retención de IRPF a cuenta de la AEAT.
 */
export function calcularFacturaAlquiler(baseImponible: number): {
  baseImponible: number;
  cuotaIva21: number;
  retencionIrpf19: number;
  totalPagarArrendador: number;
} {
  const base = Number(baseImponible.toFixed(2));
  const iva = Number((base * 0.21).toFixed(2));
  const retencion = Number((base * 0.19).toFixed(2));
  const total = Number((base + iva - retencion).toFixed(2));

  return {
    baseImponible: base,
    cuotaIva21: iva,
    retencionIrpf19: retencion,
    totalPagarArrendador: total
  };
}

/**
 * Autorellena el borrador oficial del Modelo 115 (Retenciones Arrendamientos de Inmuebles Urbanos).
 */
export function generarBorradorModelo115(
  ejercicio: number,
  periodo: '1T' | '2T' | '3T' | '4T',
  inmuebles: InmuebleArrendado[],
  mesesEnPeriodo: number = 3
): BorradorModelo115 {
  const perceptores = new Set(inmuebles.map(i => i.arrendador.nifCif)).size;
  let baseTotal = 0;
  let retencionesTotal = 0;

  for (const inm of inmuebles) {
    const basePeriodo = inm.baseImponibleMensual * mesesEnPeriodo;
    const retPeriodo = inm.retencionMensual * mesesEnPeriodo;
    baseTotal += basePeriodo;
    retencionesTotal += retPeriodo;
  }

  baseTotal = Number(baseTotal.toFixed(2));
  retencionesTotal = Number(retencionesTotal.toFixed(2));

  return {
    ejercicio,
    periodo,
    casilla_01_numero_perceptores: perceptores,
    casilla_02_base_retenciones: baseTotal,
    casilla_03_importe_retenciones: retencionesTotal,
    casilla_05_total_ingresar: retencionesTotal
  };
}

/**
 * Autorellena el borrador oficial del Modelo 180 (Resumen Anual con Referencias Catastrales).
 */
export function generarBorradorModelo180(
  ejercicio: number,
  inmuebles: InmuebleArrendado[]
): BorradorModelo180 {
  const registros = inmuebles.map(inm => {
    const baseAnual = Number((inm.baseImponibleMensual * 12).toFixed(2));
    const retAnual = Number((inm.retencionMensual * 12).toFixed(2));
    return {
      nifArrendador: inm.arrendador.nifCif,
      nombreArrendador: inm.arrendador.razonSocial,
      referenciaCatastral: inm.referenciaCatastral,
      direccion: inm.direccionCompleta,
      baseImponibleAnual: baseAnual,
      retencion19Anual: retAnual
    };
  });

  const totalBases = Number(registros.reduce((acc, r) => acc + r.baseImponibleAnual, 0).toFixed(2));
  const totalRetenciones = Number(registros.reduce((acc, r) => acc + r.retencion19Anual, 0).toFixed(2));

  return {
    ejercicio,
    totalArrendadores: registros.length,
    totalBases,
    totalRetenciones,
    inmueblesRegistrados: registros
  };
}
