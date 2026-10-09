import { FacturaOperacion, PagoRecibido, EstadoPago } from './types';
import { generarNumeroRecibo } from './numbering';

/**
 * Registra un abono (parcial o total) sobre una factura emitida.
 * Regla de negocio y fiscal RD 1619/2012:
 * - NO emite una nueva factura.
 * - Genera un Recibo de Abono Parcial con ID oficial 'REC-[DOC]-XX'.
 * - Actualiza saldo acumulado, saldo pendiente y estado.
 * - Si cancela la deuda, marca 'requiere_envio_factura_completa: true'.
 */
export function registrarAbono(
  factura: FacturaOperacion,
  importe: number,
  metodo: PagoRecibido['metodo_pago'] = 'Transferencia Bancaria',
  fecha: string = new Date().toISOString().split('T')[0]
): { facturaActualizada: FacturaOperacion; nuevoRecibo: PagoRecibido } {
  const indicePago = factura.historial_pagos_recibidos.length + 1;
  const reciboId = generarNumeroRecibo(factura.expediente_id || factura.factura_id, indicePago);

  const nuevoRecibo: PagoRecibido = {
    recibo_id: reciboId,
    fecha_pago: fecha,
    importe_abonado: Number(importe.toFixed(2)),
    metodo_pago: metodo
  };

  const nuevoAcumulado = Number(
    (factura.estado_gestion_cobros.abono_acumulado_parcial + nuevoRecibo.importe_abonado).toFixed(2)
  );

  const totalFactura = factura.totales_operacion.importe_total_factura;
  const nuevoPendiente = Math.max(0, Number((totalFactura - nuevoAcumulado).toFixed(2)));

  const estaCompletamenteCobrada = nuevoPendiente <= 0.01;
  const nuevoEstado: EstadoPago = estaCompletamenteCobrada
    ? 'COBRADA_TOTAL'
    : nuevoAcumulado > 0
    ? 'COBRADA_PARCIALMENTE'
    : 'PENDIENTE';

  const plazosRestantes = estaCompletamenteCobrada
    ? 0
    : Math.max(0, factura.cronograma_vencimientos.abonos_restantes_pendientes - 1);

  const facturaActualizada: FacturaOperacion = {
    ...factura,
    estado_gestion_cobros: {
      abono_acumulado_parcial: nuevoAcumulado,
      importe_pendiente_abono: nuevoPendiente,
      estado_pago: nuevoEstado,
      requiere_envio_recibo_automatico: !estaCompletamenteCobrada,
      requiere_envio_factura_completa: estaCompletamenteCobrada
    },
    cronograma_vencimientos: {
      ...factura.cronograma_vencimientos,
      abonos_restantes_pendientes: plazosRestantes,
      proximo_abono_obligatorio: estaCompletamenteCobrada ? null : factura.cronograma_vencimientos.proximo_abono_obligatorio
    },
    historial_pagos_recibidos: [...factura.historial_pagos_recibidos, nuevoRecibo]
  };

  return { facturaActualizada, nuevoRecibo };
}

/**
 * Formateador de moneda en EUR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formateador de fechas en formato DD/MM/AAAA
 */
export function formatDateES(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
