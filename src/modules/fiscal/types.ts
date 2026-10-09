/**
 * GESTARIAN Fiscal & Schema Specification
 * Normativa Española: Real Decreto 1619/2012, Ley 37/1992 del IVA, y Sede Electrónica AEAT.
 */

export type PlanVersion = 'LITE' | 'QUICK' | 'PRO' | 'ENTERPRISE';

export type EstadoPago = 'PENDIENTE' | 'COBRADA_PARCIALMENTE' | 'COBRADA_TOTAL';

export interface ClienteFiscal {
  razon_social: string;
  cif_nif: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface TotalesOperacion {
  base_imponible_total: number;
  tipo_iva_aplicado: number;
  cuota_iva_total: number;
  importe_total_factura: number;
  moneda: 'EUR';
}

export interface ProximoAbono {
  fecha_vencimiento: string;
  importe_cuota: number;
}

export interface CronogramaVencimientos {
  plazos_obligatorios_atender: boolean;
  total_plazos_acordados: number;
  abonos_restantes_pendientes: number;
  proximo_abono_obligatorio?: ProximoAbono | null;
}

export interface PagoRecibido {
  recibo_id: string;
  fecha_pago: string;
  importe_abonado: number;
  metodo_pago: 'Transferencia Bancaria' | 'Tarjeta' | 'Efectivo' | 'Bizum' | 'Domiciliación';
  notas?: string;
}

export interface EstadoGestionCobros {
  abono_acumulado_parcial: number;
  importe_pendiente_abono: number;
  estado_pago: EstadoPago;
  requiere_envio_recibo_automatico: boolean;
  requiere_envio_factura_completa: boolean;
}

export interface FacturaOperacion {
  factura_id: string;
  tipo_documento: 'ORDINARIA' | 'ANTICIPO' | 'FINAL_LIQUIDACION' | 'RECTIFICATIVA';
  factura_rectificativa_origen_id?: string; // Para facturas FR26XXXX que rectifican una factura previa
  expediente_id?: string;
  fecha_emision: string;
  version_plan: PlanVersion;
  cliente: ClienteFiscal;
  descripcion_servicio?: string;
  totales_operacion: TotalesOperacion;
  estado_gestion_cobros: EstadoGestionCobros;
  cronograma_vencimientos: CronogramaVencimientos;
  historial_pagos_recibidos: PagoRecibido[];
}

export interface PresupuestoOperacion {
  presupuesto_id: string; // Estándar: P4T260082 o PRES-26001
  solicitud_id?: string;   // Estándar cliente: SOL-2026-001
  expediente_id?: string;  // Estándar taller: EXP-26001 o EXP-2026-0842
  fecha_creacion: string;
  cliente: ClienteFiscal;
  vehiculo_o_referencia?: {
    matricula_o_id: string;
    marca_modelo: string;
    descripcion_trabajo: string;
    fotos_recepcion: string[];
  };
  total_estimado: number;
  estado: 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
}

export interface Modelo303Borrador {
  ejercicio: number;
  periodo: '1T' | '2T' | '3T' | '4T';
  casilla_01_base_21: number;
  casilla_03_cuota_21: number;
  casilla_07_total_devengado: number;
  casilla_28_base_deducible: number;
  casilla_29_cuota_deducible: number;
  casilla_45_total_deducible: number;
  casilla_46_resultado_regularizacion: number;
  casilla_71_resultado_declaracion: number;
}
