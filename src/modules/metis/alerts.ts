/**
 * Integrador de Alertas Fiscales, Laborales y de Negocio "METIS"
 * Centraliza las notificaciones reactivas y proactivas para PRO y ENTERPRISE.
 */

import { FacturaOperacion, PlanVersion } from '../fiscal/types';
import { Empleado } from '../laboral/types';
import { InmuebleArrendado, ActivoPropiedad } from '../activos/types';

export interface MetisAlerta {
  id: string;
  tipo: 'COBRO' | 'LABORAL_SEPE' | 'ACTIVO_INMUEBLE' | 'AEAT_CALENDARIO';
  prioridad: 'INFO' | 'AVISO' | 'CRITICA';
  titulo: string;
  mensaje: string;
  fecha: string;
  accionRecomendada?: {
    label: string;
    targetTab: string;
    requierePlan?: PlanVersion;
  };
}

/**
 * Evalúa el estado del sistema y devuelve la lista de alertas activas de Metis.
 */
export function generarAlertasMetis(params: {
  plan: PlanVersion;
  facturas: FacturaOperacion[];
  empleados: Empleado[];
  inmuebles: InmuebleArrendado[];
  activos: ActivoPropiedad[];
  fechaSimulada?: Date;
}): MetisAlerta[] {
  const alertas: MetisAlerta[] = [];
  const now = params.fechaSimulada || new Date();
  const diaMes = now.getDate();

  // 1. ALERTAS DE FACTURACIÓN Y COBROS (Ambas versiones)
  for (const f of params.facturas) {
    if (f.estado_gestion_cobros.estado_pago === 'COBRADA_PARCIALMENTE') {
      const v = f.cronograma_vencimientos.proximo_abono_obligatorio;
      if (v) {
        const fVenc = new Date(v.fecha_vencimiento);
        const diffDias = Math.floor((fVenc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDias < 0) {
          alertas.push({
            id: `COBRO-RETRASO-${f.factura_id}`,
            tipo: 'COBRO',
            prioridad: 'CRITICA',
            titulo: `⚠️ Cuota vencida · Factura ${f.factura_id}`,
            mensaje: `El cliente ${f.cliente.razon_social} tiene vencida la cuota de ${v.importe_cuota.toFixed(2)} € desde el ${v.fecha_vencimiento}. Pendiente: ${f.estado_gestion_cobros.importe_pendiente_abono.toFixed(2)} €.`,
            fecha: now.toISOString().split('T')[0],
            accionRecomendada: {
              label: 'Reclamar Cuota',
              targetTab: 'cobros'
            }
          });
        } else if (diffDias <= 7) {
          alertas.push({
            id: `COBRO-PROXIMO-${f.factura_id}`,
            tipo: 'COBRO',
            prioridad: 'AVISO',
            titulo: `Próximo vencimiento de abono · Factura ${f.factura_id}`,
            mensaje: `Cuota de ${v.importe_cuota.toFixed(2)} € programada para el ${v.fecha_vencimiento} (${diffDias} días restantes).`,
            fecha: now.toISOString().split('T')[0],
            accionRecomendada: {
              label: 'Ver Factura',
              targetTab: 'cobros'
            }
          });
        }
      }
    }
  }

  // 2. ALERTAS LABORALES Y SEPE (Ambas versiones)
  for (const emp of params.empleados) {
    if (emp.tipoContrato === 'TEMPORAL' && emp.fechaFinContrato) {
      const fFin = new Date(emp.fechaFinContrato);
      const diffDias = Math.floor((fFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias >= 0 && diffDias <= 15) {
        alertas.push({
          id: `SEPE-FIN-CONTRATO-${emp.id}`,
          tipo: 'LABORAL_SEPE',
          prioridad: 'AVISO',
          titulo: `Fin de contrato temporal SEPE · ${emp.nombre} ${emp.apellidos}`,
          mensaje: `El contrato de ${emp.nombre} finaliza el ${emp.fechaFinContrato} (${diffDias} días). Requiere comunicación al SEPE y liquidación o renovación contractual.`,
          fecha: now.toISOString().split('T')[0],
          accionRecomendada: {
            label: 'Gestionar Nómina',
            targetTab: 'nominas'
          }
        });
      }
    }

    if (emp.periodoPruebaFin) {
      const fPrueba = new Date(emp.periodoPruebaFin);
      const diffDias = Math.floor((fPrueba.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias >= 0 && diffDias <= 7) {
        alertas.push({
          id: `SEPE-PERIODO-PRUEBA-${emp.id}`,
          tipo: 'LABORAL_SEPE',
          prioridad: 'INFO',
          titulo: `Vencimiento de periodo de prueba · ${emp.nombre} ${emp.apellidos}`,
          mensaje: `El periodo de prueba expira el ${emp.periodoPruebaFin}.`,
          fecha: now.toISOString().split('T')[0],
          accionRecomendada: {
            label: 'Ver Ficha',
            targetTab: 'nominas'
          }
        });
      }
    }
  }

  // 3. ALERTAS DE ACTIVOS E INMUEBLES
  for (const inm of params.inmuebles) {
    const fRev = new Date(inm.fechaProximaRevisionRentaIpc);
    const diffDias = Math.floor((fRev.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias <= 30 && diffDias >= 0) {
      alertas.push({
        id: `INMUEBLE-IPC-${inm.id}`,
        tipo: 'ACTIVO_INMUEBLE',
        prioridad: 'INFO',
        titulo: `Revisión IPC Alquiler Comercial · ${inm.nombreLocal}`,
        mensaje: `Hito de actualización de renta fijado para el ${inm.fechaProximaRevisionRentaIpc}. Base actual: ${inm.baseImponibleMensual.toFixed(2)} € (Retención 19%: ${inm.retencionMensual.toFixed(2)} €).`,
        fecha: now.toISOString().split('T')[0],
        accionRecomendada: {
          label: 'Ver Inmueble',
          targetTab: 'activos'
        }
      });
    }
  }

  // 4. ALERTAS DE PLAZOS FISCALES DE LA SEDE ELECTRÓNICA AEAT
  if (params.plan === 'PRO') {
    alertas.push({
      id: 'AEAT-PRO-CIERRE-GESTORIA',
      tipo: 'AEAT_CALENDARIO',
      prioridad: 'AVISO',
      titulo: 'Metis · Cierre de periodo fiscal para gestoría',
      mensaje: 'Metis: Se aproxima el cierre del periodo fiscal. Su gestoría necesita recibir la documentación. Pulse aquí para enviar el consolidado de Facturas, Nóminas y Gastos de Activos.',
      fecha: now.toISOString().split('T')[0],
      accionRecomendada: {
        label: 'Enviar Consolidado a Gestoría',
        targetTab: 'nominas'
      }
    });
  } else if (params.plan === 'ENTERPRISE') {
    // Alertas por calendario oficial AEAT
    if (diaMes <= 5) {
      alertas.push({
        id: 'AEAT-ENT-DIA1',
        tipo: 'AEAT_CALENDARIO',
        prioridad: 'INFO',
        titulo: 'Metis · Borrador fiscal automático generado',
        mensaje: 'Borrador de Modelos [303 / 111 / 115] generado por IA Gestarian con lectura directa de Facturas, Nóminas y Alquileres.',
        fecha: now.toISOString().split('T')[0],
        accionRecomendada: {
          label: 'Revisar Modelos AEAT',
          targetTab: 'aeat'
        }
      });
    }

    if (diaMes >= 12 && diaMes <= 16) {
      alertas.push({
        id: 'AEAT-ENT-DIA15',
        tipo: 'AEAT_CALENDARIO',
        prioridad: 'CRITICA',
        titulo: '🚨 Alerta crítica AEAT · Cierre domiciliaciones bancarias',
        mensaje: 'Día 15 del periodo fiscal: Fin del plazo para presentación telemática con domiciliación bancaria en cuenta de los Modelos 303, 111 y 115.',
        fecha: now.toISOString().split('T')[0],
        accionRecomendada: {
          label: 'Firmar y Domiciliar con Certificado',
          targetTab: 'aeat'
        }
      });
    }

    if (diaMes >= 18) {
      alertas.push({
        id: 'AEAT-ENT-DIA20',
        tipo: 'AEAT_CALENDARIO',
        prioridad: 'CRITICA',
        titulo: '🔴 Aviso final de radicación obligatoria AEAT',
        mensaje: 'Día 20 del periodo fiscal: Límite improrrogable para la presentación oficial telemática sin recargos tributarios (Modelos 303, 111 y 115).',
        fecha: now.toISOString().split('T')[0],
        accionRecomendada: {
          label: 'Radicar Telemáticamente Ahora',
          targetTab: 'aeat'
        }
      });
    }
  }

  return alertas;
}
