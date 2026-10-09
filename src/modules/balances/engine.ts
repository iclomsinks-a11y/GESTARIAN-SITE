/**
 * Módulo de Balances Financieros y Cuenta de Explotación
 * Ecosistema Inteligente de Gestión Documental GESTARIAN
 * Disponible para Planes PRO y ENTERPRISE.
 */

export interface CuentaResultadosPeriodo {
  ejercicio: number;
  periodo: string; // ej. "4T 2026" o "Enero-Octubre 2026"
  
  // 1. Ingresos
  ventasBrutas: number;
  ivaRepercutido: number;
  totalFacturadoClientes: number;
  cobradoEfectivo: number;
  pendienteCobroClientes: number;
  
  // 2. Gastos de Explotación
  comprasYProveedores: number;
  ivaSoportadoProveedores: number;
  totalGastosProveedores: number;
  
  // 3. Costes de Personal (Nóminas)
  sueldosBrutosPersonal: number;
  seguridadSocialEmpresa: number;
  retencionesIrpfEmpleados: number; // Modelo 111
  costeLaboralTotal: number;
  
  // 4. Arrendamientos e Inmuebles
  alquileresComercialesBase: number;
  retencionAlquiler19: number; // Modelo 115
  totalPagadoAlquileresNeto: number;
  
  // 5. Amortizaciones de Inmovilizado (AEAT)
  amortizacionPeriodoActivos: number;
  
  // Resultados Analíticos
  ebitda: number; // Margen antes de amortizaciones
  resultadoExplotacionEbit: number; // Beneficio operativo
  resultadoAntesImpuestos: number;
  
  // Tesorería e Impuestos a Liquidar en AEAT
  ivaNetoLiquidacion303: number; // IVA Repercutido - IVA Soportado
  totalImpuestosRetencionesAEAT: number; // Mod 111 + Mod 115 + Mod 303
  saldoNetoTesoreriaEstimado: number;
}

import { FacturaOperacion } from '../fiscal/types';
import { NominaCalculada } from '../laboral/types';
import { InmuebleArrendado, ActivoPropiedad } from '../activos/types';

export function calcularBalanceYCuentaResultados(
  facturasEmitidas: FacturaOperacion[],
  facturasRecibidas: FacturaOperacion[],
  nominas: NominaCalculada[],
  inmuebles: InmuebleArrendado[],
  activos: ActivoPropiedad[]
): CuentaResultadosPeriodo {
  // 1. Ingresos
  const ventasBrutas = facturasEmitidas.reduce((acc, f) => acc + f.totales_operacion.base_imponible_total, 0);
  const ivaRepercutido = facturasEmitidas.reduce((acc, f) => acc + f.totales_operacion.cuota_iva_total, 0);
  const totalFacturadoClientes = ventasBrutas + ivaRepercutido;
  const cobradoEfectivo = facturasEmitidas.reduce((acc, f) => acc + f.estado_gestion_cobros.abono_acumulado_parcial, 0);
  const pendienteCobroClientes = facturasEmitidas.reduce((acc, f) => acc + f.estado_gestion_cobros.importe_pendiente_abono, 0);

  // 2. Compras
  const comprasYProveedores = facturasRecibidas.reduce((acc, f) => acc + f.totales_operacion.base_imponible_total, 0);
  const ivaSoportadoProveedores = facturasRecibidas.reduce((acc, f) => acc + f.totales_operacion.cuota_iva_total, 0);
  const totalGastosProveedores = comprasYProveedores + ivaSoportadoProveedores;

  // 3. Personal (Mensual x 3 para estimar el trimestre o base actual)
  const sueldosBrutosPersonal = nominas.reduce((acc, n) => acc + n.totalDevengadoBruto, 0);
  const seguridadSocialEmpresa = nominas.reduce((acc, n) => acc + n.costeSeguridadSocialEmpresa.totalSeguridadSocialEmpresa, 0);
  const retencionesIrpfEmpleados = nominas.reduce((acc, n) => acc + n.deduccionesTrabajador.retencionIrpf, 0);
  const costeLaboralTotal = nominas.reduce((acc, n) => acc + n.costeTotalEmpresa, 0);

  // 4. Alquileres
  const alquileresComercialesBase = inmuebles.reduce((acc, i) => acc + i.baseImponibleMensual, 0);
  const retencionAlquiler19 = inmuebles.reduce((acc, i) => acc + i.retencionMensual, 0);
  const totalPagadoAlquileresNeto = inmuebles.reduce((acc, i) => acc + i.totalFacturaPagarMensual, 0);

  // 5. Amortizaciones (Cuota mensual estimada = anual / 12)
  const amortizacionPeriodoActivos = activos.reduce((acc, a) => acc + (a.cuotaAnual / 12), 0);

  // Cálculos contables
  const margenBruto = ventasBrutas - comprasYProveedores;
  const ebitda = margenBruto - costeLaboralTotal - alquileresComercialesBase;
  const resultadoExplotacionEbit = ebitda - amortizacionPeriodoActivos;
  const resultadoAntesImpuestos = resultadoExplotacionEbit;

  // Fiscalidad AEAT
  const ivaNetoLiquidacion303 = ivaRepercutido - ivaSoportadoProveedores;
  const totalImpuestosRetencionesAEAT = Math.max(0, ivaNetoLiquidacion303) + retencionesIrpfEmpleados + retencionAlquiler19;
  const saldoNetoTesoreriaEstimado = cobradoEfectivo - totalGastosProveedores - costeLaboralTotal - totalPagadoAlquileresNeto;

  return {
    ejercicio: 2026,
    periodo: '4T 2026 · Octubre',
    ventasBrutas,
    ivaRepercutido,
    totalFacturadoClientes,
    cobradoEfectivo,
    pendienteCobroClientes,
    comprasYProveedores,
    ivaSoportadoProveedores,
    totalGastosProveedores,
    sueldosBrutosPersonal,
    seguridadSocialEmpresa,
    retencionesIrpfEmpleados,
    costeLaboralTotal,
    alquileresComercialesBase,
    retencionAlquiler19,
    totalPagadoAlquileresNeto,
    amortizacionPeriodoActivos,
    ebitda,
    resultadoExplotacionEbit,
    resultadoAntesImpuestos,
    ivaNetoLiquidacion303,
    totalImpuestosRetencionesAEAT,
    saldoNetoTesoreriaEstimado
  };
}
