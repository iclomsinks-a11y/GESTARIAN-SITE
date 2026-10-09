import { FacturaOperacion, Modelo303Borrador, PlanVersion } from '../fiscal/types';
import { NominaCalculada, BorradorModelo111, BorradorModelo190 } from '../laboral/types';
import { InmuebleArrendado, BorradorModelo115, BorradorModelo180 } from '../activos/types';

export { generarBorradorModelo111, generarBorradorModelo190 } from '../laboral/engine';
export { generarBorradorModelo115, generarBorradorModelo180 } from '../activos/engine';

/**
 * Restricción estricta de ejecución (BLOQUE 8):
 * Si un entorno bajo el plan PRO intenta invocar la integración telemática directa con la AEAT
 * o el parseador del certificado digital, bloquea la acción.
 */
export function validarAccesoTelematicoAEAT(plan: PlanVersion): void {
  if (plan !== 'ENTERPRISE') {
    throw new Error('Esta funcionalidad de comunicación directa con la AEAT requiere actualizar su suscripción al Plan Enterprise');
  }
}

/**
 * Calcula de forma agregada el borrador del Modelo 303 (IVA Trimestral)
 * leyendo Facturas Emitidas y Facturas Recibidas según normativa de la AEAT (RD 1619/2012).
 */
export function generarBorradorModelo303(
  ejercicio: number,
  periodo: '1T' | '2T' | '3T' | '4T',
  facturasEmitidas: FacturaOperacion[],
  facturasRecibidas: FacturaOperacion[]
): Modelo303Borrador {
  // IVA Devengado (Ventas / Emitidas)
  let baseDevengada = 0;
  let cuotaDevengada = 0;

  for (const f of facturasEmitidas) {
    baseDevengada += f.totales_operacion.base_imponible_total;
    cuotaDevengada += f.totales_operacion.cuota_iva_total;
  }

  // IVA Deducible (Compras / Recibidas)
  let baseDeducible = 0;
  let cuotaDeducible = 0;

  for (const f of facturasRecibidas) {
    baseDeducible += f.totales_operacion.base_imponible_total;
    cuotaDeducible += f.totales_operacion.cuota_iva_total;
  }

  baseDevengada = Number(baseDevengada.toFixed(2));
  cuotaDevengada = Number(cuotaDevengada.toFixed(2));
  baseDeducible = Number(baseDeducible.toFixed(2));
  cuotaDeducible = Number(cuotaDeducible.toFixed(2));

  const totalDevengado = cuotaDevengada;
  const totalDeducible = cuotaDeducible;
  const resultado = Number((totalDevengado - totalDeducible).toFixed(2));

  return {
    ejercicio,
    periodo,
    casilla_01_base_21: baseDevengada,
    casilla_03_cuota_21: cuotaDevengada,
    casilla_07_total_devengado: totalDevengado,
    casilla_28_base_deducible: baseDeducible,
    casilla_29_cuota_deducible: cuotaDeducible,
    casilla_45_total_deducible: totalDeducible,
    casilla_46_resultado_regularizacion: resultado,
    casilla_71_resultado_declaracion: resultado
  };
}
