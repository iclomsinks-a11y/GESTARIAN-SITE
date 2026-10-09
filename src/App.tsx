import React, { useState, useMemo, useEffect } from 'react';
import { PlanVersion, FacturaOperacion, PresupuestoOperacion } from './modules/fiscal/types';
import { registrarAbono, formatCurrency, formatDateES } from './modules/fiscal/engine';
import { generarBorradorModelo303, validarAccesoTelematicoAEAT } from './modules/aeat/modelos';
import { procesarCertificadoDigital, CertificadoAEATInfo } from './modules/aeat/certificate';
import {
  generarNumeroFacturaOrdinaria,
  generarNumeroFacturaRectificativa,
  generarNumeroPresupuesto,
  generarNumeroRegistroFacturaRecibida,
  generarNumeroSolicitudPresupuesto,
  generarNumeroExpediente
} from './modules/fiscal/numbering';

// Módulos Laborales (TGSS, SEPE, AEAT)
import { Empleado, NominaCalculada, BorradorModelo111, BorradorModelo190 } from './modules/laboral/types';
import { calcularNomina, generarBorradorModelo111, generarBorradorModelo190, GRUPOS_COTIZACION_2026 } from './modules/laboral/engine';
import { EMPLEADOS_MOCK } from './modules/laboral/mockData';

// Módulos de Activos e Inmuebles Arrendados (19% IRPF + Referencia Catastral)
import { ActivoPropiedad, InmuebleArrendado, BorradorModelo115, BorradorModelo180 } from './modules/activos/types';
import { calcularAmortizacionActivo, calcularFacturaAlquiler, generarBorradorModelo115, generarBorradorModelo180 } from './modules/activos/engine';
import { ACTIVOS_PROPIEDAD_MOCK, INMUEBLES_ARRENDADOS_MOCK } from './modules/activos/mockData';

// Integrador de Inteligencia METIS
import { MetisAlerta, generarAlertasMetis } from './modules/metis/alerts';

// Modales Oficiales y Componentes Documentales
import { ModalVerNomina } from './components/ModalVerNomina';
import { ModalVerModeloOficial, TipoModeloAEAT } from './components/ModalVerModeloOficial';
import { ModalDocumentoMinimalista, DocumentoMinimalistaData } from './components/ModalDocumentoMinimalista';
import ClientLogin from './modules/portal-clientes/Login';
import ConfiguracionPage from './modules/configuracion/ConfiguracionPage';

// Control Horario, Escáner de Nóminas y Gestión de Empleados
import { RegistroFichaje, FICHAJES_MOCK, registrarFichajeEntrada, registrarFichajeSalida } from './modules/laboral/controlHorario';
import { CorreoNominaDetectado, CORREOS_NOMINAS_MOCK } from './modules/laboral/scannerCorreo';
import { EmpleadoAutorizadoUsuario, EMPLEADOS_AUTORIZADOS_MOCK, darDeAltaEmpleadoAutorizado } from './modules/laboral/empleadosService';

// Balances Financieros y Red Empresarial B2B
import { calcularBalanceYCuentaResultados, CuentaResultadosPeriodo } from './modules/balances/engine';
import { DemandaOfertaEmpresarial, DEMANDAS_RED_EMPRESARIAL_MOCK } from './modules/red_empresarial/mockData';

// Datos iniciales de facturas con numeración estándar oficial
const FACTURAS_EMITIDAS_MOCK: FacturaOperacion[] = [
  {
    factura_id: 'F260489',
    tipo_documento: 'ORDINARIA',
    expediente_id: 'EP260082',
    fecha_emision: '2026-10-01',
    version_plan: 'PRO',
    cliente: {
      razon_social: 'Soluciones Tecnológicas S.A.',
      cif_nif: 'A87654321',
      email: 'facturacion@soluciones-tec.com',
      telefono: '+34 912 345 678'
    },
    descripcion_servicio: 'Desarrollo de software y automatización documental',
    totales_operacion: {
      base_imponible_total: 1000.0,
      tipo_iva_aplicado: 21.0,
      cuota_iva_total: 210.0,
      importe_total_factura: 1210.0,
      moneda: 'EUR'
    },
    estado_gestion_cobros: {
      abono_acumulado_parcial: 400.0,
      importe_pendiente_abono: 810.0,
      estado_pago: 'COBRADA_PARCIALMENTE',
      requiere_envio_recibo_automatico: true,
      requiere_envio_factura_completa: false
    },
    cronograma_vencimientos: {
      plazos_obligatorios_atender: true,
      total_plazos_acordados: 3,
      abonos_restantes_pendientes: 2,
      proximo_abono_obligatorio: {
        fecha_vencimiento: '2026-11-20',
        importe_cuota: 405.0
      }
    },
    historial_pagos_recibidos: [
      {
        recibo_id: 'REC-F260489-01',
        fecha_pago: '2026-10-01',
        importe_abonado: 400.0,
        metodo_pago: 'Transferencia Bancaria'
      }
    ]
  },
  {
    factura_id: 'FR1260001',
    tipo_documento: 'RECTIFICATIVA',
    factura_rectificativa_origen_id: 'F260001',
    expediente_id: 'EP260001',
    fecha_emision: '2026-10-06',
    version_plan: 'PRO',
    cliente: {
      razon_social: 'Soluciones Tecnológicas S.A.',
      cif_nif: 'A87654321',
      email: 'facturacion@soluciones-tec.com',
      telefono: '+34 912 345 678'
    },
    descripcion_servicio: 'Factura Rectificativa Oficial por abono y ajuste de base sobre factura F260001 (RD 1619/2012)',
    totales_operacion: {
      base_imponible_total: -200.0,
      tipo_iva_aplicado: 21.0,
      cuota_iva_total: -42.0,
      importe_total_factura: -242.0,
      moneda: 'EUR'
    },
    estado_gestion_cobros: {
      abono_acumulado_parcial: -242.0,
      importe_pendiente_abono: 0.0,
      estado_pago: 'COBRADA_TOTAL',
      requiere_envio_recibo_automatico: false,
      requiere_envio_factura_completa: true
    },
    cronograma_vencimientos: {
      plazos_obligatorios_atender: false,
      total_plazos_acordados: 1,
      abonos_restantes_pendientes: 0,
      proximo_abono_obligatorio: null
    },
    historial_pagos_recibidos: [
      {
        recibo_id: 'REC-FR1260001-01',
        fecha_pago: '2026-10-06',
        importe_abonado: -242.0,
        metodo_pago: 'Transferencia Bancaria'
      }
    ]
  },
  {
    factura_id: 'F260490',
    tipo_documento: 'ORDINARIA',
    expediente_id: 'EP260490',
    fecha_emision: '2026-10-03',
    version_plan: 'PRO',
    cliente: {
      razon_social: 'Talleres y Logística Ibérica S.L.',
      cif_nif: 'B98765432',
      email: 'admon@talleresiberica.es'
    },
    descripcion_servicio: 'Mantenimiento integral y repuestos flota comercial',
    totales_operacion: {
      base_imponible_total: 2500.0,
      tipo_iva_aplicado: 21.0,
      cuota_iva_total: 525.0,
      importe_total_factura: 3025.0,
      moneda: 'EUR'
    },
    estado_gestion_cobros: {
      abono_acumulado_parcial: 3025.0,
      importe_pendiente_abono: 0.0,
      estado_pago: 'COBRADA_TOTAL',
      requiere_envio_recibo_automatico: false,
      requiere_envio_factura_completa: true
    },
    cronograma_vencimientos: {
      plazos_obligatorios_atender: false,
      total_plazos_acordados: 1,
      abonos_restantes_pendientes: 0,
      proximo_abono_obligatorio: null
    },
    historial_pagos_recibidos: [
      {
        recibo_id: 'REC-F260490-01',
        fecha_pago: '2026-10-03',
        importe_abonado: 3025.0,
        metodo_pago: 'Transferencia Bancaria'
      }
    ]
  }
];

const FACTURAS_RECIBIDAS_MOCK: FacturaOperacion[] = [
  {
    factura_id: 'FR4T260112',
    tipo_documento: 'ORDINARIA',
    fecha_emision: '2026-10-02',
    version_plan: 'PRO',
    cliente: {
      razon_social: 'Suministros Industriales del Sur S.A.',
      cif_nif: 'A41223344',
      email: 'facturas@suministrosur.es'
    },
    descripcion_servicio: 'Suministro de consumibles y recambios homologados (Nº Proveedor: B-98442)',
    totales_operacion: {
      base_imponible_total: 600.0,
      tipo_iva_aplicado: 21.0,
      cuota_iva_total: 126.0,
      importe_total_factura: 726.0,
      moneda: 'EUR'
    },
    estado_gestion_cobros: {
      abono_acumulado_parcial: 726.0,
      importe_pendiente_abono: 0.0,
      estado_pago: 'COBRADA_TOTAL',
      requiere_envio_recibo_automatico: false,
      requiere_envio_factura_completa: true
    },
    cronograma_vencimientos: {
      plazos_obligatorios_atender: false,
      total_plazos_acordados: 1,
      abonos_restantes_pendientes: 0,
      proximo_abono_obligatorio: null
    },
    historial_pagos_recibidos: [
      {
        recibo_id: 'REC-FR4T260112-01',
        fecha_pago: '2026-10-02',
        importe_abonado: 726.0,
        metodo_pago: 'Transferencia Bancaria'
      }
    ]
  }
];

const PRESUPUESTOS_MOCK: PresupuestoOperacion[] = [
  {
    presupuesto_id: 'P260082', // P260000 estándar oficial sin trimestre
    solicitud_id: 'S260000', // S260000 estándar oficial
    expediente_id: 'EP260082', // E + presupuesto: EP260082
    fecha_creacion: '2026-10-05',
    cliente: {
      razon_social: 'Transportes Marítimos Gómez S.L.',
      cif_nif: 'B11223344',
      email: 'logistica@transgomez.es'
    },
    vehiculo_o_referencia: {
      matricula_o_id: '7845-KMM',
      marca_modelo: 'Furgón Isotermo Iveco Daily',
      descripcion_trabajo: 'Revisión motor, sustitución pastillas de freno y cambio correa de distribución.',
      fotos_recepcion: ['/assets/vehiculo-evolucion.jpg']
    },
    total_estimado: 1450.0,
    estado: 'ENVIADO'
  },
  {
    presupuesto_id: 'P260000',
    solicitud_id: 'S260001',
    expediente_id: 'EP260000',
    fecha_creacion: '2026-10-01',
    cliente: {
      razon_social: 'Soluciones Tecnológicas S.A.',
      cif_nif: 'A87654321',
      email: 'facturacion@soluciones-tec.com'
    },
    vehiculo_o_referencia: {
      matricula_o_id: '1289-JBW',
      marca_modelo: 'Renault Master 2.3 dCi',
      descripcion_trabajo: 'Diagnosis electrónica integral y mantenimiento preventivo bimensual.',
      fotos_recepcion: ['/assets/vehiculo-evolucion.jpg']
    },
    total_estimado: 890.0,
    estado: 'ENVIADO'
  }
];

export interface ClienteItem {
  id: string;
  razonSocial: string;
  cifNif: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  tipo: 'EMPRESA' | 'AUTONOMO' | 'PARTICULAR';
  plan: PlanVersion;
  vehiculos: Array<{
    matricula: string;
    marcaModelo: string;
    km: string;
    bastidor?: string;
  }>;
  expedientesCount: number;
  totalFacturado: number;
  saldoPendiente: number;
  observaciones?: string;
}

const CLIENTES_MOCK: ClienteItem[] = [
  {
    id: 'CLI-001',
    razonSocial: 'Soluciones Tecnológicas S.A.',
    cifNif: 'A87654321',
    telefono: '+34 912 345 678',
    email: 'facturacion@soluciones-tec.com',
    direccion: 'Calle Innovación 42, Parque Tecnológico',
    ciudad: 'Madrid',
    codigoPostal: '28050',
    provincia: 'Madrid',
    tipo: 'EMPRESA',
    plan: 'PRO',
    vehiculos: [
      { matricula: '1289-JBW', marcaModelo: 'Renault Master 2.3 dCi', km: '62.400 km', bastidor: 'VF1MA0004928174' }
    ],
    expedientesCount: 3,
    totalFacturado: 1210.0,
    saldoPendiente: 810.0,
    observaciones: 'Cliente corporativo con facturación mensual recurrente y flota comercial.'
  },
  {
    id: 'CLI-002',
    razonSocial: 'Talleres y Logística Ibérica S.L.',
    cifNif: 'B98765432',
    telefono: '+34 934 112 233',
    email: 'admon@talleresiberica.es',
    direccion: 'Polígono Industrial Can Valero, Nave 14',
    ciudad: 'Barcelona',
    codigoPostal: '08040',
    provincia: 'Barcelona',
    tipo: 'EMPRESA',
    plan: 'PRO',
    vehiculos: [
      { matricula: '9921-MBX', marcaModelo: 'Mercedes-Benz Actros 1845', km: '148.900 km', bastidor: 'WDB9634031L8821' }
    ],
    expedientesCount: 2,
    totalFacturado: 3025.0,
    saldoPendiente: 0.0,
    observaciones: 'Mantenimientos integrales al día. Facturas liquidadas por transferencia.'
  },
  {
    id: 'CLI-003',
    razonSocial: 'Juan Pérez Gómez',
    cifNif: '12345678Z',
    telefono: '+34 600 123 456',
    email: 'cliente@gestarian.com',
    direccion: 'Avenida de la Constitución 18, 3ºB',
    ciudad: 'Madrid',
    codigoPostal: '28012',
    provincia: 'Madrid',
    tipo: 'PARTICULAR',
    plan: 'PRO',
    vehiculos: [
      { matricula: '4421-HJK', marcaModelo: 'Mercedes-Benz Sprinter 316 CDI', km: '84.210 km', bastidor: 'WDB9066351S8421' },
      { matricula: '2849-LKR', marcaModelo: 'Mercedes-Benz A200d', km: '41.500 km', bastidor: 'WDD1770081J2849' }
    ],
    expedientesCount: 1,
    totalFacturado: 459.80,
    saldoPendiente: 259.80,
    observaciones: 'Expediente EXP-2026-0842 activo en taller. Cita confirmada y presupuesto #PRE-2026-419 aceptado.'
  },
  {
    id: 'CLI-004',
    razonSocial: 'Transportes Marítimos Gómez S.L.',
    cifNif: 'B11223344',
    telefono: '+34 956 789 012',
    email: 'logistica@transgomez.es',
    direccion: 'Muelle de Poniente s/n, Zona Portuaria',
    ciudad: 'Cádiz',
    codigoPostal: '11006',
    provincia: 'Cádiz',
    tipo: 'EMPRESA',
    plan: 'PRO',
    vehiculos: [
      { matricula: '7845-KMM', marcaModelo: 'Furgón Isotermo Iveco Daily', km: '112.000 km', bastidor: 'ZCFC65A11059281' }
    ],
    expedientesCount: 1,
    totalFacturado: 1450.0,
    saldoPendiente: 1450.0,
    observaciones: 'Presupuesto #P260082 en curso. Revisión de distribución e isotermo.'
  },
  {
    id: 'CLI-005',
    razonSocial: 'Transportes & Logística S.L.',
    cifNif: 'B77889900',
    telefono: '+34 918 765 432',
    email: 'flotas@transporteslogistica.com',
    direccion: 'Carretera de Toledo Km 12',
    ciudad: 'Getafe',
    codigoPostal: '28905',
    provincia: 'Madrid',
    tipo: 'EMPRESA',
    plan: 'ENTERPRISE',
    vehiculos: [
      { matricula: '7104-MTP', marcaModelo: 'Ford Transit Custom 2.0 EcoBlue', km: '56.300 km', bastidor: 'WF0YXXTTGY12839' }
    ],
    expedientesCount: 2,
    totalFacturado: 641.30,
    saldoPendiente: 0.0,
    observaciones: 'Cliente corporativo interconectado en Red B2B Enterprise con 10 estaciones.'
  }
];

export interface ClientSession {
  email: string;
  dni: string;
  razonSocial: string;
  isCliente: boolean;
  plan: PlanVersion;
}

export type TabKey = 'clientes' | 'cobros' | 'emitidas' | 'recibidas' | 'presupuestos' | 'nominas' | 'activos' | 'balances' | 'metis' | 'aeat' | 'red_empresarial' | 'config';

export default function SuiteApp() {
  const [activePlan, setActivePlan] = useState<PlanVersion>('PRO');
  const [activeTab, setActiveTab] = useState<TabKey>('clientes');
  
  const [clientes, setClientes] = useState<ClienteItem[]>(CLIENTES_MOCK);
  const [expandedClientId, setExpandedClientId] = useState<string | null>('CLI-003');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ClienteItem>>({});
  const [searchClientes, setSearchClientes] = useState('');
  const [filtroTipoCliente, setFiltroTipoCliente] = useState<string>('TODOS');
  const [clienteAEliminarConfirm, setClienteAEliminarConfirm] = useState<ClienteItem | null>(null);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [nuevoClienteForm, setNuevoClienteForm] = useState<Partial<ClienteItem>>({
    tipo: 'PARTICULAR',
    plan: 'PRO',
    ciudad: 'Madrid',
    provincia: 'Madrid'
  });
  
  const [facturasEmitidas, setFacturasEmitidas] = useState<FacturaOperacion[]>(FACTURAS_EMITIDAS_MOCK);
  const [facturasRecibidas, setFacturasRecibidas] = useState<FacturaOperacion[]>(FACTURAS_RECIBIDAS_MOCK);
  const [presupuestos] = useState<PresupuestoOperacion[]>(PRESUPUESTOS_MOCK);

  // Módulos Laborales y de Activos
  const [empleados, setEmpleados] = useState<Empleado[]>(EMPLEADOS_MOCK);
  const [activos, setActivos] = useState<ActivoPropiedad[]>(ACTIVOS_PROPIEDAD_MOCK);
  const [inmuebles, setInmuebles] = useState<InmuebleArrendado[]>(INMUEBLES_ARRENDADOS_MOCK);

  // Modales Oficiales de Hacienda y Nóminas (Botón "VER")
  const [modalModeloActivo, setModalModeloActivo] = useState<TipoModeloAEAT | null>(null);
  const [modalNominaActiva, setModalNominaActiva] = useState<NominaCalculada | null>(null);
  const [documentoMinimalistaActivo, setDocumentoMinimalistaActivo] = useState<DocumentoMinimalistaData | null>(null);

  // Funciones para abrir documentos en formato minimalista Gestarian Quick
  const abrirFacturaMinimalista = (f: FacturaOperacion) => {
    const data: DocumentoMinimalistaData = {
      tipo: 'FACTURA',
      id: f.factura_id,
      fecha: f.fecha_emision,
      fechaPropuestaEntrega: '2026-10-15',
      expedienteId: f.expediente_id,
      estado: f.estado_gestion_cobros.estado_pago,
      emisor: {
        nombre: 'DM CAR TALLER MECÁNICO S.L.',
        cif: 'B12345678',
        direccion: 'Calle Metalurgia 18, 28830 Madrid',
        telefono: '+34 912 345 678',
        email: 'facturacion@dmcar-taller.es'
      },
      cliente: {
        razonSocial: f.cliente.razon_social,
        cifNif: f.cliente.cif_nif,
        direccion: f.cliente.direccion,
        telefono: f.cliente.telefono,
        email: f.cliente.email
      },
      vehiculo: {
        marcaModelo: 'Mercedes-Benz A200d (W177)',
        matricula: '2849-LKR',
        km: '84.215'
      },
      lineas: [
        {
          concepto: f.descripcion_servicio || 'Mano de obra técnica y recambios oficiales según orden de taller finalizada',
          cantidad: 1,
          precioUnitario: f.totales_operacion.base_imponible_total,
          total: f.totales_operacion.base_imponible_total
        }
      ],
      totales: {
        baseImponible: f.totales_operacion.base_imponible_total,
        tipoIva: 21,
        cuotaIva: f.totales_operacion.cuota_iva_total,
        total: f.totales_operacion.importe_total_factura,
        cobrado: f.estado_gestion_cobros.abono_acumulado_parcial,
        pendiente: f.estado_gestion_cobros.importe_pendiente_abono
      },
      observaciones: 'Factura oficial generada conforme al Real Decreto 1619/2012 y Registro Fiscal.'
    };
    setDocumentoMinimalistaActivo(data);
  };

  const abrirPresupuestoMinimalista = (p: PresupuestoOperacion) => {
    const data: DocumentoMinimalistaData = {
      tipo: 'PRESUPUESTO',
      id: p.presupuesto_id,
      fecha: p.fecha_creacion,
      fechaPropuestaEntrega: '2026-10-14',
      expedienteId: p.expediente_id,
      solicitudId: p.solicitud_id,
      estado: p.estado,
      emisor: {
        nombre: 'DM CAR TALLER MECÁNICO S.L.',
        cif: 'B12345678',
        direccion: 'Calle Metalurgia 18, 28830 Madrid',
        telefono: '+34 912 345 678',
        email: 'contacto@dmcar-taller.es'
      },
      cliente: {
        razonSocial: p.cliente.razon_social,
        cifNif: p.cliente.cif_nif,
        direccion: p.cliente.direccion,
        telefono: p.cliente.telefono,
        email: p.cliente.email
      },
      vehiculo: p.vehiculo_o_referencia ? {
        marcaModelo: p.vehiculo_o_referencia.marca_modelo,
        matricula: p.vehiculo_o_referencia.matricula_o_id
      } : {
        marcaModelo: 'Mercedes-Benz A200d',
        matricula: '2849-LKR'
      },
      lineas: [
        { concepto: p.vehiculo_o_referencia?.descripcion_trabajo || 'Revisión y mantenimiento general de taller', cantidad: 1, precioUnitario: p.total_estimado / 1.21, total: p.total_estimado / 1.21 }
      ],
      totales: {
        baseImponible: p.total_estimado / 1.21,
        tipoIva: 21,
        cuotaIva: p.total_estimado - (p.total_estimado / 1.21),
        total: p.total_estimado
      },
      observaciones: 'Presupuesto técnico de recepción. La factura final se emitirá una vez finalizados los trabajos en el Roadmap.'
    };
    setDocumentoMinimalistaActivo(data);
  };

  const abrirReciboMinimalista = (factura: FacturaOperacion, reciboIndex: number = 0) => {
    const recibo = factura.historial_pagos_recibidos[reciboIndex] || {
      recibo_id: `R-${factura.factura_id}`,
      fecha_pago: factura.fecha_emision,
      importe_abonado: factura.estado_gestion_cobros.abono_acumulado_parcial || factura.totales_operacion.importe_total_factura,
      metodo_pago: 'Transferencia Bancaria'
    };
    const data: DocumentoMinimalistaData = {
      tipo: 'RECIBO',
      id: recibo.recibo_id,
      fecha: recibo.fecha_pago,
      expedienteId: factura.expediente_id,
      estado: 'ABONADO / CONCILIADO',
      emisor: {
        nombre: 'DM CAR TALLER MECÁNICO S.L.',
        cif: 'B12345678',
        direccion: 'Calle Metalurgia 18, 28830 Madrid',
        telefono: '+34 912 345 678',
        email: 'cobros@dmcar-taller.es'
      },
      cliente: {
        razonSocial: factura.cliente.razon_social,
        cifNif: factura.cliente.cif_nif,
        direccion: factura.cliente.direccion,
        email: factura.cliente.email
      },
      vehiculo: {
        marcaModelo: 'Mercedes-Benz A200d',
        matricula: '2849-LKR'
      },
      lineas: [
        { concepto: `Abono oficial a cuenta de Factura ${factura.factura_id} (${recibo.metodo_pago})`, cantidad: 1, precioUnitario: recibo.importe_abonado, total: recibo.importe_abonado }
      ],
      totales: {
        baseImponible: recibo.importe_abonado / 1.21,
        tipoIva: 21,
        cuotaIva: recibo.importe_abonado - (recibo.importe_abonado / 1.21),
        total: recibo.importe_abonado,
        cobrado: recibo.importe_abonado,
        pendiente: factura.estado_gestion_cobros.importe_pendiente_abono
      },
      metodoPago: recibo.metodo_pago,
      observaciones: `Justificante oficial de cobro vinculado a la factura ${factura.factura_id}.`
    };
    setDocumentoMinimalistaActivo(data);
  };

  // Escáner de Correo Entrante para Nóminas (Gestoría)
  const [correosNominas, setCorreosNominas] = useState<CorreoNominaDetectado[]>(CORREOS_NOMINAS_MOCK);
  const [scannerAutoActivo, setScannerAutoActivo] = useState<boolean>(true);
  const [isEscaneandoCorreo, setIsEscaneandoCorreo] = useState<boolean>(false);

  // Datos para Envío a la Gestoría (Manual, Preprogramados, Control Horario)
  const [subtabNomina, setSubtabNomina] = useState<'general' | 'scanner' | 'gestoria' | 'fichajes' | 'empleados'>('general');
  const [datosEnvioGestoria, setDatosEnvioGestoria] = useState<{
    modo: 'MANUAL' | 'PREPROGRAMADO' | 'HORAS_CONTROL';
    horasExtras: number;
    dietas: number;
    incidencias: string;
    observaciones: string;
  }>({
    modo: 'HORAS_CONTROL',
    horasExtras: 14.5,
    dietas: 180.0,
    incidencias: 'Sin bajas médicas en el periodo. 1 permiso retribuido de 2 días.',
    observaciones: 'Datos consolidados automáticamente desde el control horario de DM Car Taller.'
  });

  // Control Horario y Fichajes de Jornada (Área Empleado Autorizado)
  const [fichajes, setFichajes] = useState<RegistroFichaje[]>(FICHAJES_MOCK);
  const [empleadoActivoFichajeId, setEmpleadoActivoFichajeId] = useState<string>('EMP-003');
  const [pausaFichajeMinutos, setPausaFichajeMinutos] = useState<number>(30);

  // Gestión y Alta de Empleados Autorizados
  const [empleadosAutorizados, setEmpleadosAutorizados] = useState<EmpleadoAutorizadoUsuario[]>(EMPLEADOS_AUTORIZADOS_MOCK);
  const [isModalAltaEmpleadoOpen, setIsModalAltaEmpleadoOpen] = useState<boolean>(false);
  const [formAltaEmpleado, setFormAltaEmpleado] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rol: 'MECANICO_OPERARIO' as 'MECANICO_OPERARIO' | 'ADMINISTRATIVO' | 'JEFE_TALLER',
    grupoCotizacion: 8,
    salarioBase: 1800
  });
  const [ultimoEnlaceEnviado, setUltimoEnlaceEnviado] = useState<{
    nombre: string;
    email: string;
    telefono: string;
    enlace: string;
    mensajeWhatsApp: string;
  } | null>(null);

  // Modelo 180 Anual: Explicación y Estado
  const [simulacionPeriodoAnual180, setSimulacionPeriodoAnual180] = useState<boolean>(false);

  // Red Empresarial B2B (Compartir Demanda de Bienes o Servicios - ENTERPRISE)
  const [demandasRed, setDemandasRed] = useState<DemandaOfertaEmpresarial[]>(DEMANDAS_RED_EMPRESARIAL_MOCK);
  const [filtroRed, setFiltroRed] = useState<'TODAS' | 'DEMANDA' | 'OFERTA'>('TODAS');
  const [isModalNuevaDemandaOpen, setIsModalNuevaDemandaOpen] = useState<boolean>(false);
  const [formNuevaDemanda, setFormNuevaDemanda] = useState({
    tipo: 'DEMANDA' as 'DEMANDA' | 'OFERTA',
    titulo: '',
    categoria: 'MECANICA_VEHICULOS' as const,
    descripcion: '',
    presupuestoEstimado: '',
    urgencia: 'ALTA' as const,
    contacto: ''
  });

  // Estados de modales y cobros
  const [selectedFactura, setSelectedFactura] = useState<FacturaOperacion | null>(null);
  const [abonoImporte, setAbonoImporte] = useState<string>('');
  const [notificacion, setNotificacion] = useState<string | null>(null);

  // Estado de sesión y autenticación cliente
  const [clientSession, setClientSession] = useState<ClientSession | null>(() => {
    try {
      const saved = localStorage.getItem('gestarian_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isCliente || parsed.rol === 'CLIENTE') {
          return {
            email: parsed.email,
            dni: parsed.dni || 'A87654321',
            razonSocial: parsed.razonSocial || parsed.nombre || 'Cliente',
            isCliente: true,
            plan: parsed.plan || 'PRO'
          };
        }
      }
    } catch (e) {
      console.warn('Error reading session:', e);
    }
    return null;
  });

  const [isClientLoginOpen, setIsClientLoginOpen] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputDni, setInputDni] = useState('');
  const [loginPlanChoice, setLoginPlanChoice] = useState<PlanVersion>('PRO');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estado del certificado digital AEAT (Enterprise)
  const [certInfo, setCertInfo] = useState<CertificadoAEATInfo | null>(null);
  const [certPassword, setCertPassword] = useState<string>('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certLoading, setCertLoading] = useState<boolean>(false);
  const [certError, setCertError] = useState<string | null>(null);

  // Sincronización de eventos de autenticación y hash de navegación
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs: TabKey[] = ['clientes', 'cobros', 'emitidas', 'recibidas', 'presupuestos', 'nominas', 'activos', 'balances', 'metis', 'aeat', 'red_empresarial', 'config'];
      if (validTabs.includes(hash as TabKey)) {
        setActiveTab(hash as TabKey);
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);

    const handleAuthChange = (e: any) => {
      const u = e.detail;
      if (u && (u.isCliente || u.rol === 'CLIENTE')) {
        setClientSession({
          email: u.email,
          dni: u.dni || 'A87654321',
          razonSocial: u.razonSocial || u.nombre || 'Cliente',
          isCliente: true,
          plan: u.plan || 'PRO'
        });
        if (u.plan) {
          setActivePlan(u.plan);
        }
      }
    };
    window.addEventListener('gestarian-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('gestarian-auth-change', handleAuthChange);
    };
  }, []);

  // Notificación flotante de auto-cierre
  const showNotice = (msg: string) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(null), 4500);
  };

  // Cálculos reactivos de nóminas y modelos
  const nominasCalculadas = useMemo(() => {
    return empleados.map(emp => calcularNomina(emp, '2026-10'));
  }, [empleados]);

  // Balance y Cuenta de Resultados reactivo (PRO y ENTERPRISE)
  const balanceCalculado = useMemo(() => {
    return calcularBalanceYCuentaResultados(facturasEmitidas, facturasRecibidas, nominasCalculadas, inmuebles, activos);
  }, [facturasEmitidas, facturasRecibidas, nominasCalculadas, inmuebles, activos]);

  const borrador303 = useMemo(() => {
    return generarBorradorModelo303(2026, '4T', facturasEmitidas, facturasRecibidas);
  }, [facturasEmitidas, facturasRecibidas]);

  const borrador111 = useMemo(() => {
    return generarBorradorModelo111(2026, '4T', nominasCalculadas);
  }, [nominasCalculadas]);

  const borrador190 = useMemo(() => {
    return generarBorradorModelo190(2026, nominasCalculadas);
  }, [nominasCalculadas]);

  const borrador115 = useMemo(() => {
    return generarBorradorModelo115(2026, '4T', inmuebles);
  }, [inmuebles]);

  const borrador180 = useMemo(() => {
    return generarBorradorModelo180(2026, inmuebles);
  }, [inmuebles]);

  const alertasMetis = useMemo(() => {
    return generarAlertasMetis({
      plan: activePlan,
      facturas: facturasEmitidas,
      empleados,
      inmuebles,
      activos
    });
  }, [activePlan, facturasEmitidas, empleados, inmuebles, activos]);

  // Manejador de Login de Cliente
  const handleClientLogin = (emailArg?: string, dniArg?: string, planArg?: PlanVersion) => {
    const emailToUse = (emailArg || inputEmail).trim().toLowerCase();
    const dniToUse = (dniArg || inputDni).replace(/[\s\-_.]/g, '').toUpperCase().trim();
    const planToUse = planArg || loginPlanChoice;

    if (!emailToUse || !dniToUse) {
      setLoginError('Por favor introduce email y DNI/CIF.');
      return;
    }

    const match = [
      { email: 'facturacion@soluciones-tec.com', dni: 'A87654321', nombre: 'Soluciones Tecnológicas S.A.' },
      { email: 'logistica@transgomez.es', dni: 'B11223344', nombre: 'Transportes Marítimos Gómez SL' },
      { email: 'admon@talleresiberica.es', dni: 'B98765432', nombre: 'Talleres y Logística Ibérica S.L.' },
      { email: 'facturas@suministrosur.es', dni: 'A41223344', nombre: 'Suministros Industriales del Sur S.A.' },
      { email: 'cliente@gestarian.com', dni: '12345678Z', nombre: 'Cliente Particular DM Car' }
    ].find(c => c.email.toLowerCase() === emailToUse && (c.dni === dniToUse || c.dni.replace(/[\s\-_.]/g, '') === dniToUse));

    const razon = match ? match.nombre : emailToUse.split('@')[0].toUpperCase();

    const newSession: ClientSession = {
      email: emailToUse,
      dni: dniToUse,
      razonSocial: razon,
      isCliente: true,
      plan: planToUse
    };

    setClientSession(newSession);
    setActivePlan(planToUse);
    localStorage.setItem('gestarian_user_session', JSON.stringify({
      ...newSession,
      rol: 'CLIENTE'
    }));
    localStorage.setItem('gestarian_cliente_portal_saved_auth', JSON.stringify({
      email: emailToUse,
      pass: dniToUse,
      nombre: razon
    }));

    setIsClientLoginOpen(false);
    setLoginError(null);
    showNotice(`¡Sesión iniciada con éxito! Acceso a ${planToUse} activado para ${razon} (${dniToUse})`);
  };

  const handleLogout = () => {
    setClientSession(null);
    localStorage.removeItem('gestarian_user_session');
    showNotice('Sesión de cliente cerrada. Modo taller restaurado.');
  };

  // Acción rápida 1-clic para registrar abono
  const handleRegistrarAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactura) return;
    const importeNum = parseFloat(abonoImporte);
    if (isNaN(importeNum) || importeNum <= 0) return;

    const { facturaActualizada, nuevoRecibo } = registrarAbono(selectedFactura, importeNum);

    setFacturasEmitidas(prev => prev.map(f => f.factura_id === facturaActualizada.factura_id ? facturaActualizada : f));
    setSelectedFactura(null);
    setAbonoImporte('');

    if (facturaActualizada.estado_gestion_cobros.estado_pago === 'COBRADA_TOTAL') {
      showNotice(`¡Factura ${facturaActualizada.factura_id} liquidada al 100%! Factura Completa enviada automáticamente.`);
    } else {
      showNotice(`Abono de ${formatCurrency(nuevoRecibo.importe_abonado)} registrado. Recibo ${nuevoRecibo.recibo_id} generado y enviado.`);
    }
  };

  // Procesamiento certificado digital AEAT (Restricción estricta Bloque 8)
  const handleCargarCertificado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePlan !== 'ENTERPRISE') {
      setCertError('Esta funcionalidad de comunicación directa con la AEAT requiere actualizar su suscripción al Plan Enterprise');
      showNotice('Esta funcionalidad de comunicación directa con la AEAT requiere actualizar su suscripción al Plan Enterprise');
      return;
    }

    if (!certFile) {
      setCertError('Por favor selecciona un archivo .p12 o .pfx');
      return;
    }
    setCertLoading(true);
    setCertError(null);
    try {
      const info = await procesarCertificadoDigital(certFile, certPassword, activePlan);
      setCertInfo(info);
      setCertPassword('');
      showNotice(`Certificado cargado con éxito para ${info.titular}`);
    } catch (err: any) {
      setCertError(err.message || 'Error al validar certificado');
    } finally {
      setCertLoading(false);
    }
  };

  // Botón "Enviar a la Gestoría" (Plan PRO)
  const handleEnviarAGestoria = (tipo: 'nominas' | 'activos' | 'consolidado') => {
    if (tipo === 'nominas') {
      showNotice(`Metis: Fichero de costes salariales y retenciones IRPF compilado (${nominasCalculadas.length} empleados). Transmitido con éxito a la gestoría.`);
    } else if (tipo === 'activos') {
      showNotice(`Metis: Listado analítico de Inmovilizado y Retenciones del 19% de Alquiler (${inmuebles[0]?.referenciaCatastral}) enviado con éxito a la gestoría.`);
    } else {
      showNotice('Metis: Consolidado fiscal trimestral completo (Facturas + Nóminas + Alquileres) transmitido con éxito a la gestoría.');
    }
  };

  // Presentación telemática con Certificado Digital (Plan ENTERPRISE)
  const handlePresentarTelematicoAEAT = (modelo: string) => {
    if (activePlan !== 'ENTERPRISE') {
      showNotice('Esta funcionalidad de comunicación directa con la AEAT requiere actualizar su suscripción al Plan Enterprise');
      return;
    }
    if (!certInfo) {
      showNotice(`Por favor incorpora tu certificado digital antes de radicar el Modelo ${modelo}.`);
      setActiveTab('aeat');
      return;
    }
    showNotice(`🔐 Modelo ${modelo} firmado telemáticamente con certificado de ${certInfo.titular} (NIF: ${certInfo.nif}). Radicación oficial completada con código CSV AEAT.`);
  };

  // 1. Control Horario: Fichar Entrada (Iniciar Jornada)
  const handleFicharEntrada = () => {
    const emp = empleados.find(e => e.id === empleadoActivoFichajeId) || empleados[0];
    const nuevoFichaje = registrarFichajeEntrada(emp.id, `${emp.nombre} ${emp.apellidos}`);
    setFichajes(prev => [nuevoFichaje, ...prev]);
    showNotice(`⏱️ Fichaje de ENTRADA grabado para ${emp.nombre} a las ${nuevoFichaje.horaEntrada}. Jornada iniciada.`);
  };

  // 2. Control Horario: Fichar Salida (Finalizar Jornada)
  const handleFicharSalida = (fichaje: RegistroFichaje) => {
    const actualizado = registrarFichajeSalida(fichaje, pausaFichajeMinutos);
    setFichajes(prev => prev.map(f => f.id === fichaje.id ? actualizado : f));
    showNotice(`🏁 Fichaje de SALIDA grabado. ${actualizado.horasEfectivas}h efectivas computadas.`);
  };

  // 3. Escáner de Correo Entrante para Nóminas (Gestoría)
  const handleEscanearCorreoAhora = () => {
    setIsEscaneandoCorreo(true);
    setTimeout(() => {
      setIsEscaneandoCorreo(false);
      showNotice('📧 Escáner de correo completado: 1 nueva remesa de nóminas selladas detectada de laboral@gestoriaramos-asesores.com. Datos sincronizados.');
    }, 1200);
  };

  // 4. Envío de Datos a la Gestoría (Manual, Preprogramados, Control Horario)
  const handleEnviarDatosAGestoriaConModo = () => {
    if (datosEnvioGestoria.modo === 'HORAS_CONTROL') {
      const horasTotales = fichajes.filter(f => f.estado === 'COMPLETADA').reduce((acc, f) => acc + f.horasEfectivas, 0);
      showNotice(`📤 Transmisión completada: ${horasTotales.toFixed(1)} horas de trabajo efectivas volcadas desde el Control Horario a la gestoría.`);
    } else if (datosEnvioGestoria.modo === 'PREPROGRAMADO') {
      showNotice('📤 Transmisión completada: Plantilla recurrente preprogramada del día 25 enviada con éxito a la gestoría.');
    } else {
      showNotice(`📤 Transmisión completada: Incidencias manuales enviadas (Horas extras: ${datosEnvioGestoria.horasExtras}h, Dietas: ${formatCurrency(datosEnvioGestoria.dietas)}).`);
    }
  };

  // 5. Alta y Gestión de Empleados Autorizados con Enlaces por Email y WhatsApp
  const handleDarAltaEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAltaEmpleado.nombre || !formAltaEmpleado.email || !formAltaEmpleado.telefono) {
      showNotice('Por favor completa el nombre, email y teléfono del empleado.');
      return;
    }

    const nuevoEmpId = `EMP-${String(empleados.length + 1).padStart(3, '0')}`;
    const nuevoEmpleado: Empleado = {
      id: nuevoEmpId,
      nif: `${Math.floor(10000000 + Math.random() * 90000000)}X`,
      nombre: formAltaEmpleado.nombre,
      apellidos: formAltaEmpleado.apellidos,
      email: formAltaEmpleado.email,
      grupoCotizacion: formAltaEmpleado.grupoCotizacion,
      puesto: formAltaEmpleado.rol === 'JEFE_TALLER' ? 'Jefe de Taller' : formAltaEmpleado.rol === 'ADMINISTRATIVO' ? 'Oficial Administrativo' : 'Mecánico / Operario',
      cnaeEmpresa: '4520 - Mantenimiento y reparación de vehículos de motor',
      convenioColectivo: 'Convenio Provincial del Metal y Talleres de Reparación',
      tipoContrato: 'INDEFINIDO',
      fechaInicioContrato: new Date().toISOString().split('T')[0],
      salarioBaseMensual: formAltaEmpleado.salarioBase,
      complementosSalariales: 150.0,
      devengosNoSalariales: 50.0,
      porcentajeIrpf: 13.0,
      prorrateoPagasExtras: true
    };

    const res = darDeAltaEmpleadoAutorizado(nuevoEmpleado, formAltaEmpleado.telefono, formAltaEmpleado.rol);

    setEmpleados(prev => [...prev, nuevoEmpleado]);
    setEmpleadosAutorizados(prev => [...prev, res.usuario]);
    setUltimoEnlaceEnviado({
      nombre: res.usuario.nombre,
      email: res.usuario.email,
      telefono: res.usuario.telefono,
      enlace: res.enlaceApp,
      mensajeWhatsApp: res.mensajeWhatsApp
    });

    setIsModalAltaEmpleadoOpen(false);
    setFormAltaEmpleado({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      rol: 'MECANICO_OPERARIO',
      grupoCotizacion: 8,
      salarioBase: 1800
    });

    showNotice(`✅ Empleado ${res.usuario.nombre} dado de alta. Enlace de instalación de la aplicación enviado por Email y WhatsApp.`);
  };

  // 6. Publicación en Red Empresarial B2B (Enterprise)
  const handlePublicarDemandaRed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevaDemanda.titulo || !formNuevaDemanda.descripcion) {
      showNotice('Por favor completa el título y descripción.');
      return;
    }

    const nueva: DemandaOfertaEmpresarial = {
      id: `RED-${Date.now()}`,
      tipo: formNuevaDemanda.tipo,
      titulo: formNuevaDemanda.titulo,
      categoria: formNuevaDemanda.categoria,
      descripcion: formNuevaDemanda.descripcion,
      empresaEmisora: 'DM CAR TALLER MECÁNICO S.L.',
      cif: 'B12345678',
      ubicacion: 'Madrid',
      presupuestoEstimado: formNuevaDemanda.presupuestoEstimado || 'A convenir',
      fechaPublicacion: new Date().toISOString().split('T')[0],
      urgencia: formNuevaDemanda.urgencia,
      contacto: formNuevaDemanda.contacto || 'operaciones@dmcar-taller.es',
      estado: 'ACTIVA'
    };

    setDemandasRed(prev => [nueva, ...prev]);
    setIsModalNuevaDemandaOpen(false);
    setFormNuevaDemanda({
      tipo: 'DEMANDA',
      titulo: '',
      categoria: 'MECANICA_VEHICULOS',
      descripcion: '',
      presupuestoEstimado: '',
      urgencia: 'ALTA',
      contacto: ''
    });

    showNotice(`🤝 Publicación compartida con éxito en la Red Empresarial B2B Gestarian.`);
  };

  // 7. Gestión de Clientes: Expansión, Edición y Eliminación
  const toggleExpandClient = (id: string) => {
    if (expandedClientId === id) {
      setExpandedClientId(null);
      setEditingClientId(null);
      setClienteAEliminarConfirm(null);
    } else {
      setExpandedClientId(id);
      setEditingClientId(null);
      setClienteAEliminarConfirm(null);
    }
  };

  const handleStartEditCliente = (c: ClienteItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClientId(c.id);
    setExpandedClientId(c.id);
    setEditFormData({ ...c });
    setClienteAEliminarConfirm(null);
    showNotice(`✏️ Editando ficha de: ${c.razonSocial}`);
  };

  const handleSaveEditCliente = (id: string) => {
    setClientes(prev => prev.map(c => c.id === id ? ({ ...c, ...editFormData } as ClienteItem) : c));
    setEditingClientId(null);
    setClienteAEliminarConfirm(null);
    showNotice(`✓ Cambios guardados para ${editFormData.razonSocial || 'el cliente'}.`);
  };

  const handleConfirmDeleteCliente = (id: string) => {
    const cli = clientes.find(c => c.id === id);
    setClientes(prev => prev.filter(c => c.id !== id));
    if (expandedClientId === id) setExpandedClientId(null);
    if (editingClientId === id) setEditingClientId(null);
    setClienteAEliminarConfirm(null);
    showNotice(`🗑️ Cliente ${cli?.razonSocial || ''} eliminado de la base de datos.`);
  };

  const handleCrearNuevoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoClienteForm.razonSocial || !nuevoClienteForm.cifNif) {
      showNotice('Indica al menos el nombre o razón social y el NIF/CIF.');
      return;
    }
    const nuevo: ClienteItem = {
      id: `CLI-${Date.now().toString().slice(-4)}`,
      razonSocial: nuevoClienteForm.razonSocial,
      cifNif: nuevoClienteForm.cifNif,
      telefono: nuevoClienteForm.telefono || '',
      email: nuevoClienteForm.email || '',
      direccion: nuevoClienteForm.direccion || 'Sin dirección registrada',
      ciudad: nuevoClienteForm.ciudad || 'Madrid',
      codigoPostal: nuevoClienteForm.codigoPostal || '28001',
      provincia: nuevoClienteForm.provincia || 'Madrid',
      tipo: nuevoClienteForm.tipo || 'PARTICULAR',
      plan: (nuevoClienteForm.plan as PlanVersion) || 'PRO',
      vehiculos: nuevoClienteForm.vehiculos?.length ? nuevoClienteForm.vehiculos : [
        {
          matricula: 'PENDIENTE',
          marcaModelo: 'Vehículo por asignar',
          km: '0 km'
        }
      ],
      expedientesCount: 0,
      totalFacturado: 0,
      saldoPendiente: 0,
      observaciones: nuevoClienteForm.observaciones || ''
    };
    setClientes(prev => [nuevo, ...prev]);
    setExpandedClientId(nuevo.id);
    setModalNuevoCliente(false);
    setNuevoClienteForm({ tipo: 'PARTICULAR', plan: 'PRO', ciudad: 'Madrid', provincia: 'Madrid' });
    showNotice(`✓ Cliente ${nuevo.razonSocial} dado de alta con éxito.`);
  };

  return (
    <div className="min-h-screen bg-[#04040a] text-[#f8f7ff] font-['Inter',sans-serif] selection:bg-[#a855f7]/30 selection:text-white pb-16">
      {/* Barra de Notificación Flotante */}
      {notificacion && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16142a] border border-[#a855f7]/60 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in text-sm max-w-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shrink-0 animate-pulse"></span>
          <span>{notificacion}</span>
        </div>
      )}

      {/* Top Header Unificado */}
      <header className="sticky top-0 z-40 bg-[#04040a]/90 backdrop-blur-md border-b border-white/8 px-3 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <a href="/" className="text-lg md:text-xl font-bold tracking-wider font-['Outfit'] bg-gradient-to-r from-white via-[#c4b5fd] to-[#f5c451] bg-clip-text text-transparent">
            GESTARIAN
          </a>
          <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 tracking-wide uppercase">
            Suite Unificada
          </span>
        </div>

        {/* Selector de Plan Activo */}
        <div className="flex items-center gap-1 bg-[#0e0c1c] p-1 rounded-xl border border-white/10 text-xs overflow-x-auto max-w-full">
          {(['LITE', 'QUICK', 'PRO', 'ENTERPRISE'] as PlanVersion[]).map(plan => {
            const isActive = activePlan === plan;
            return (
              <button
                key={plan}
                onClick={() => {
                  setActivePlan(plan);
                  if (plan === 'LITE' && (activeTab === 'aeat' || activeTab === 'presupuestos' || activeTab === 'nominas' || activeTab === 'activos')) {
                    setActiveTab('cobros');
                  }
                  showNotice(`Plan comercial activo: GESTARIAN ${plan}`);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {plan}
              </button>
            );
          })}
        </div>

        {/* Estado de Sesión / Botón Acceso Cliente */}
        <div className="flex items-center gap-2">
          {clientSession ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-white">{clientSession.razonSocial}</span>
              <span className="text-white/50 text-[10px]">({clientSession.dni})</span>
              <button
                onClick={handleLogout}
                className="ml-1 text-[11px] text-rose-300 hover:text-rose-200 underline transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsClientLoginOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
            >
              <span>👤 Acceso Cliente (Email + DNI)</span>
            </button>
          )}

          <a
            href="/#universo"
            className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center gap-1"
          >
            <span>Ver Universo</span>
          </a>
        </div>
      </header>

      {/* Navegación por Pestañas Minimalistas */}
      <nav className="max-w-7xl mx-auto px-4 md:px-8 mt-5">
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/10 pb-3 no-scrollbar text-xs md:text-sm">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'clientes' ? 'bg-gradient-to-r from-[#a855f7]/30 to-[#6366f1]/30 text-white border border-[#a855f7]/50 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <span>👥 Clientes</span>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-mono">{clientes.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('cobros')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'cobros' ? 'bg-white/10 text-white border border-white/15' : 'text-white/60 hover:text-white'
            }`}
          >
            Panel de Cobros
          </button>
          <button
            onClick={() => setActiveTab('emitidas')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'emitidas' ? 'bg-white/10 text-white border border-white/15' : 'text-white/60 hover:text-white'
            }`}
          >
            Facturas Emitidas
          </button>
          <button
            onClick={() => setActiveTab('recibidas')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'recibidas' ? 'bg-white/10 text-white border border-white/15' : 'text-white/60 hover:text-white'
            }`}
          >
            Facturas Recibidas
          </button>
          {activePlan !== 'LITE' && activePlan !== 'QUICK' && (
            <button
              onClick={() => setActiveTab('presupuestos')}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === 'presupuestos' ? 'bg-white/10 text-white border border-white/15' : 'text-white/60 hover:text-white'
              }`}
            >
              Presupuestos y Recepción
            </button>
          )}
          {activePlan !== 'LITE' && activePlan !== 'QUICK' && (
            <button
              onClick={() => setActiveTab('nominas')}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === 'nominas' ? 'bg-white/10 text-white border border-white/15' : 'text-white/60 hover:text-white'
              }`}
            >
              Nóminas & Personal (TGSS)
            </button>
          )}
          {activePlan !== 'LITE' && activePlan !== 'QUICK' && (
            <button
              onClick={() => setActiveTab('activos')}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === 'activos' ? 'bg-white/10 text-white border border-white/15' : 'text-white/60 hover:text-white'
              }`}
            >
              Activos & Alquileres (19%)
            </button>
          )}
          {activePlan !== 'LITE' && activePlan !== 'QUICK' && (
            <button
              onClick={() => setActiveTab('balances')}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'balances' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>📊 Balances Financieros</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('metis')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'metis' ? 'bg-[#a855f7]/20 text-[#d8b4fe] border border-[#a855f7]/40' : 'text-white/60 hover:text-white'
            }`}
          >
            <span>Alertas Metis</span>
            <span className="w-2 h-2 rounded-full bg-[#f5c451]"></span>
          </button>
          <button
            onClick={() => setActiveTab('aeat')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'aeat' ? 'bg-[#6366f1]/20 text-[#c4b5fd] border border-[#6366f1]/40' : 'text-white/60 hover:text-white'
            }`}
          >
            <span>🏛️ Sede AEAT</span>
            {activePlan !== 'ENTERPRISE' && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-white/60">🔒 Enterprise</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('red_empresarial')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'red_empresarial' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-white/60 hover:text-white'
            }`}
          >
            <span>🤝 Red B2B</span>
            {activePlan !== 'ENTERPRISE' && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-white/60">🔒 Enterprise</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'config' ? 'bg-white/10 text-white border border-white/15' : 'text-white/60 hover:text-white'
            }`}
          >
            Configuración
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        
        {/* TAB 0: DIRECTORIO / PÁGINA DE CLIENTES (TARJETAS EXPANDIBLES, 8 ICONOS & EDICIÓN CON ELIMINAR AL FINAL) */}
        {activeTab === 'clientes' && (
          <section className="space-y-6">
            {/* Cabecera de la Página Clientes */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit'] flex items-center gap-2">
                  <span>Directorio de Clientes</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#d8b4fe]">
                    {clientes.length} Registrados
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-white/60 mt-0.5">
                  Base de datos centralizada de clientes. Toca cualquier tarjeta para expandirla y acceder a sus 8 acciones y edición.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalNuevoCliente(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white font-semibold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>＋ Nuevo Cliente</span>
                </button>
              </div>
            </div>

            {/* Barra de Filtro y Búsqueda */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e0c1d] border border-white/8 p-3 rounded-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre, CIF/NIF, teléfono, email, matrícula..."
                  value={searchClientes}
                  onChange={(e) => setSearchClientes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#a855f7]/60"
                />
                {searchClientes && (
                  <button
                    type="button"
                    onClick={() => setSearchClientes('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {['TODOS', 'EMPRESA', 'PARTICULAR'].map(tipo => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFiltroTipoCliente(tipo)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      filtroTipoCliente === tipo
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tipo === 'TODOS' ? 'Todos' : tipo === 'EMPRESA' ? 'Empresas' : 'Particulares'}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Tarjetas de Clientes */}
            <div className="grid grid-cols-1 gap-4">
              {clientes
                .filter(c => {
                  const matchSearch =
                    c.razonSocial.toLowerCase().includes(searchClientes.toLowerCase()) ||
                    c.cifNif.toLowerCase().includes(searchClientes.toLowerCase()) ||
                    c.telefono.includes(searchClientes) ||
                    c.email.toLowerCase().includes(searchClientes.toLowerCase()) ||
                    c.vehiculos.some(v => v.matricula.toLowerCase().includes(searchClientes.toLowerCase()) || v.marcaModelo.toLowerCase().includes(searchClientes.toLowerCase()));
                  const matchTipo = filtroTipoCliente === 'TODOS' || c.tipo === filtroTipoCliente;
                  return matchSearch && matchTipo;
                })
                .map(c => {
                  const isExpanded = expandedClientId === c.id;
                  const isEditing = editingClientId === c.id;

                  return (
                    <div
                      key={c.id}
                      className={`bg-[#0e0c1d] border rounded-2xl transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? 'border-[#a855f7]/40 shadow-[0_10px_35px_rgba(0,0,0,0.6)] ring-1 ring-[#a855f7]/20'
                          : 'border-white/8 hover:border-white/20 hover:bg-[#121024]'
                      }`}
                    >
                      {/* Cabecera / Tarjeta Contraída (Toca para expandir) */}
                      <div
                        onClick={() => toggleExpandClient(c.id)}
                        className="p-4 md:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Avatar con iniciales */}
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#a855f7]/25 to-[#38bdf8]/20 border border-white/10 flex items-center justify-center font-bold text-sm text-white shrink-0">
                            {c.razonSocial.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-white text-sm md:text-base">
                                {c.razonSocial}
                              </h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                                {c.cifNif}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                c.tipo === 'EMPRESA'
                                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                  : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                              }`}>
                                {c.tipo}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-white/50 mt-1 flex-wrap">
                              <span>📞 {c.telefono || 'Sin teléfono'}</span>
                              <span>✉️ {c.email || 'Sin email'}</span>
                              {c.vehiculos.length > 0 && (
                                <span className="text-amber-300/80">
                                  🚗 {c.vehiculos[0].marcaModelo} ({c.vehiculos[0].matricula})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                          <div className="text-right text-xs">
                            <div className="text-white/40 text-[11px]">Facturado</div>
                            <div className="font-mono font-bold text-white">{formatCurrency(c.totalFacturado)}</div>
                            {c.saldoPendiente > 0 && (
                              <div className="text-rose-400 font-mono text-[11px]">
                                Debe: {formatCurrency(c.saldoPendiente)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#a855f7] font-medium">
                            <span className="hidden sm:inline text-[11px] text-white/40">
                              {isExpanded ? 'Plegar' : 'Tocar para expandir'}
                            </span>
                            <div className={`w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'text-white/60'}`}>
                              ▼
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CUERPO DE LA TARJETA EXPANDIDA */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-white/10 bg-black/20 animate-fade-in space-y-4">
                          {/* SI ESTAMOS EN MODO EDICIÓN DE CLIENTE */}
                          {isEditing ? (
                            <div className="space-y-4 pt-2">
                              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#d8b4fe]">
                                  ✏️ Editando Ficha del Cliente: {c.razonSocial}
                                </span>
                                <span className="text-[11px] text-white/40">Modifica los datos y pulsa Guardar</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="text-white/50 block mb-1">Nombre o Razón Social *</label>
                                  <input
                                    type="text"
                                    value={editFormData.razonSocial || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, razonSocial: e.target.value })}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">NIF / CIF *</label>
                                  <input
                                    type="text"
                                    value={editFormData.cifNif || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, cifNif: e.target.value })}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">Teléfono Móvil (WhatsApp) *</label>
                                  <input
                                    type="text"
                                    value={editFormData.telefono || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">Correo Electrónico *</label>
                                  <input
                                    type="email"
                                    value={editFormData.email || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">Domicilio Fiscal</label>
                                  <input
                                    type="text"
                                    value={editFormData.direccion || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, direccion: e.target.value })}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">Ciudad y Código Postal</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Ciudad"
                                      value={editFormData.ciudad || ''}
                                      onChange={(e) => setEditFormData({ ...editFormData, ciudad: e.target.value })}
                                      className="w-2/3 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                    />
                                    <input
                                      type="text"
                                      placeholder="CP"
                                      value={editFormData.codigoPostal || ''}
                                      onChange={(e) => setEditFormData({ ...editFormData, codigoPostal: e.target.value })}
                                      className="w-1/3 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">Vehículo Principal (Marca y Modelo)</label>
                                  <input
                                    type="text"
                                    value={editFormData.vehiculos?.[0]?.marcaModelo || ''}
                                    onChange={(e) => {
                                      const v = editFormData.vehiculos ? [...editFormData.vehiculos] : [{ matricula: '', marcaModelo: '', km: '' }];
                                      v[0] = { ...v[0], marcaModelo: e.target.value };
                                      setEditFormData({ ...editFormData, vehiculos: v });
                                    }}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">Matrícula</label>
                                  <input
                                    type="text"
                                    value={editFormData.vehiculos?.[0]?.matricula || ''}
                                    onChange={(e) => {
                                      const v = editFormData.vehiculos ? [...editFormData.vehiculos] : [{ matricula: '', marcaModelo: '', km: '' }];
                                      v[0] = { ...v[0], matricula: e.target.value };
                                      setEditFormData({ ...editFormData, vehiculos: v });
                                    }}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 block mb-1">Observaciones / Notas de Expediente</label>
                                  <input
                                    type="text"
                                    value={editFormData.observaciones || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, observaciones: e.target.value })}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#a855f7]"
                                  />
                                </div>
                              </div>

                              {/* ACCIONES DE EDICIÓN: AL FINAL ESTÁ EL ICONO DE ELIMINAR CLIENTE */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditCliente(c.id)}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>✓ Guardar Cambios</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingClientId(null);
                                      setClienteAEliminarConfirm(null);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium text-xs transition-all cursor-pointer"
                                  >
                                    <span>Cancelar</span>
                                  </button>
                                </div>

                                {/* EXACTAMENTE AL FINAL DE EDITAR CLIENTE:
                                    Botón de eliminar cliente con forma de cubo de la basura,
                                    icono flotante, sin relleno, sin envoltorio */}
                                <div className="flex items-center gap-2 ml-auto">
                                  {clienteAEliminarConfirm?.id === c.id ? (
                                    <div className="flex items-center gap-2 p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs animate-fade-in">
                                      <span className="text-rose-300 font-medium">¿Eliminar cliente definitivamente?</span>
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmDeleteCliente(c.id)}
                                        className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-[11px] hover:bg-rose-600 transition-colors cursor-pointer"
                                      >
                                        Eliminar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setClienteAEliminarConfirm(null)}
                                        className="px-2 py-1 rounded-lg bg-white/10 text-white/70 hover:text-white text-[11px] transition-colors cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setClienteAEliminarConfirm(c)}
                                      title="Eliminar cliente definitivamente"
                                      aria-label="Eliminar cliente definitivamente"
                                      className="text-white/40 hover:text-rose-400 transition-all hover:scale-125 active:scale-95 cursor-pointer p-1.5 flex items-center gap-1.5 focus:outline-none"
                                      style={{ background: 'none', border: 'none' }}
                                    >
                                      <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                      <span className="text-[11px] text-white/30 hover:text-rose-400 font-medium hidden sm:inline">Eliminar</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* SI ESTAMOS EN MODO VISUALIZACIÓN EXPANDIDA */
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                                <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 space-y-1">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
                                    📍 Domicilio Fiscal
                                  </span>
                                  <div className="text-white font-medium">{c.direccion}</div>
                                  <div className="text-white/60">{c.codigoPostal} {c.ciudad} ({c.provincia})</div>
                                  <div className="text-white/40 text-[11px]">Régimen: IVA General 21% · España</div>
                                </div>

                                <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 space-y-1">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
                                    🚗 Vehículos Vinculados ({c.vehiculos.length})
                                  </span>
                                  {c.vehiculos.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center text-white font-medium">
                                      <span>{v.marcaModelo}</span>
                                      <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-[11px] text-[#f5c451]">
                                        {v.matricula}
                                      </span>
                                    </div>
                                  ))}
                                  {c.vehiculos[0]?.km && (
                                    <div className="text-white/50 text-[11px]">Odómetro registrado: {c.vehiculos[0].km}</div>
                                  )}
                                </div>

                                <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 space-y-1">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
                                    📊 Expedientes & Facturación
                                  </span>
                                  <div className="flex justify-between text-white/70">
                                    <span>Expedientes abiertos:</span>
                                    <strong className="text-white">{c.expedientesCount}</strong>
                                  </div>
                                  <div className="flex justify-between text-white/70">
                                    <span>Total facturado:</span>
                                    <strong className="text-emerald-400 font-mono">{formatCurrency(c.totalFacturado)}</strong>
                                  </div>
                                  <div className="flex justify-between text-white/70">
                                    <span>Saldo pendiente:</span>
                                    <strong className={c.saldoPendiente > 0 ? "text-rose-400 font-mono" : "text-emerald-400 font-mono"}>
                                      {formatCurrency(c.saldoPendiente)}
                                    </strong>
                                  </div>
                                </div>
                              </div>

                              {c.observaciones && (
                                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-xs text-white/70 leading-relaxed">
                                  ℹ️ <strong>Notas del cliente:</strong> {c.observaciones}
                                </div>
                              )}

                              {/* BARRA DE 8 ICONOS AL FINAL DE LA TARJETA EXPANDIDA */}
                              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                                <div className="text-[11px] text-white/40 font-mono flex items-center gap-1.5">
                                  <span>8 acciones rápidas</span>
                                  <span>·</span>
                                  <span className="text-white/60">Pulsa ✏️ Editar para modificar datos o eliminar cliente al final</span>
                                </div>

                                <div className="flex items-center gap-1.5 md:gap-2">
                                  {/* 1. Llamar por teléfono */}
                                  <a
                                    href={`tel:${c.telefono}`}
                                    title={`1. Llamar por teléfono (${c.telefono})`}
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                  </a>

                                  {/* 2. Enviar WhatsApp */}
                                  <a
                                    href={`https://wa.me/${c.telefono.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="2. Enviar WhatsApp directo"
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                    </svg>
                                  </a>

                                  {/* 3. Enviar Correo Electrónico */}
                                  <a
                                    href={`mailto:${c.email}`}
                                    title={`3. Enviar correo a ${c.email}`}
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-sky-500/20 text-white/60 hover:text-sky-400 border border-white/5 hover:border-sky-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                      <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                  </a>

                                  {/* 4. Ver Documentos / Facturas */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('emitidas');
                                      showNotice(`📂 Filtrando facturas para: ${c.razonSocial}`);
                                    }}
                                    title="4. Ver Documentos y Facturas vinculadas"
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 border border-white/5 hover:border-purple-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line x1="16" y1="13" x2="8" y2="13"></line>
                                      <line x1="16" y1="17" x2="8" y2="17"></line>
                                    </svg>
                                  </button>

                                  {/* 5. Ficha del Vehículo Vinculado */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showNotice(`🚗 Ficha de ${c.razonSocial}: ${c.vehiculos.map(v => `${v.marcaModelo} (${v.matricula})`).join(', ')}`);
                                    }}
                                    title="5. Ficha del Vehículo Vinculado"
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-300 border border-white/5 hover:border-amber-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="2" y="7" width="20" height="13" rx="2"></rect>
                                      <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"></path>
                                    </svg>
                                  </button>

                                  {/* 6. Control de Cobros / Recibos */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('cobros');
                                      showNotice(`💶 Estado de cobros de ${c.razonSocial}: Pendiente ${formatCurrency(c.saldoPendiente)}`);
                                    }}
                                    title="6. Control de Cobros y Recibos"
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-300 border border-white/5 hover:border-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-5 0c0 2 3 2.5 3 4.5a3.5 3.5 0 0 1-5 0"></path>
                                    </svg>
                                  </button>

                                  {/* 7. Portal de Clientes */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showNotice(`🛰️ Invitación al Portal de Clientes enviada por WhatsApp y Email a ${c.email}`);
                                    }}
                                    title="7. Invitación al Portal de Clientes"
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                  </button>

                                  {/* 8. Editar Cliente (Permite modificar y dentro de edición está el icono de eliminar cliente al final) */}
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditCliente(c)}
                                    title="8. Editar Cliente (Toca para entrar a editar y eliminar cliente al final)"
                                    className="px-2.5 py-1.5 rounded-lg bg-[#a855f7]/20 hover:bg-[#a855f7]/35 text-[#d8b4fe] hover:text-white border border-[#a855f7]/40 hover:border-[#a855f7]/70 flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    <span>Editar</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* TAB 1: PANEL DE CONTROL DE COBROS */}
        {activeTab === 'cobros' && (
          <section className="space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-['Outfit']">Panel de Control de Cobros</h1>
              <p className="text-xs md:text-sm text-white/60 mt-0.5">
                Seguimiento de abonos parciales, vencimientos obligatorios y liquidaciones completas (RD 1619/2012).
              </p>
            </div>

            {/* Listado de Facturas en Cobro */}
            <div className="grid grid-cols-1 gap-4">
              {facturasEmitidas.map((factura) => {
                const cobrado = factura.estado_gestion_cobros.abono_acumulado_parcial;
                const total = factura.totales_operacion.importe_total_factura;
                const pendiente = factura.estado_gestion_cobros.importe_pendiente_abono;
                const porcentaje = total > 0 ? Math.min(100, Math.round((cobrado / total) * 100)) : 100;

                return (
                  <div
                    key={factura.factura_id}
                    className="bg-[#0e0c1d] border border-white/8 hover:border-white/15 rounded-2xl p-5 md:p-6 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/6">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm md:text-base font-bold text-white">{factura.factura_id}</span>
                          {factura.expediente_id && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {factura.expediente_id}
                            </span>
                          )}
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            factura.estado_gestion_cobros.estado_pago === 'COBRADA_TOTAL'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : factura.estado_gestion_cobros.estado_pago === 'COBRADA_PARCIALMENTE'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {factura.estado_gestion_cobros.estado_pago === 'COBRADA_TOTAL' ? 'Cobrada Total' : 'Cobrada Parcialmente'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-1">
                          <div>
                            <div className="text-sm font-medium text-white/90">{factura.cliente.razon_social}</div>
                            <div className="text-xs text-white/50">{factura.cliente.cif_nif} · Emisión: {formatDateES(factura.fecha_emision)}</div>
                          </div>
                          {/* Iconos de la tarjeta de cliente: Llamar, WhatsApp, Email y Eliminar cliente */}
                          <div className="flex items-center gap-2">
                            {factura.cliente.telefono && (
                              <a
                                href={`tel:${factura.cliente.telefono}`}
                                title={`Llamar a ${factura.cliente.telefono}`}
                                className="text-white/40 hover:text-emerald-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                              </a>
                            )}
                            {factura.cliente.telefono && (
                              <a
                                href={`https://wa.me/${factura.cliente.telefono.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Enviar WhatsApp"
                                className="text-white/40 hover:text-emerald-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                              </a>
                            )}
                            {factura.cliente.email && (
                              <a
                                href={`mailto:${factura.cliente.email}`}
                                title={`Enviar correo a ${factura.cliente.email}`}
                                className="text-white/40 hover:text-sky-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                              </a>
                            )}
                            {/* Botón flotante eliminar cliente: cubo de basura, sin relleno, sin envoltorio */}
                            <button
                              type="button"
                              onClick={() => {
                                showNotice(`🗑️ Cliente ${factura.cliente.razon_social} eliminado de la tarjeta de cobros.`);
                              }}
                              title="Eliminar cliente"
                              aria-label="Eliminar cliente"
                              className="text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Datos Clave Obligatorios Fiscales */}
                      <div className="grid grid-cols-3 gap-3 md:gap-6 text-right">
                        <div>
                          <div className="text-[11px] text-white/50">Total Operación</div>
                          <div className="text-sm md:text-base font-bold text-white">{formatCurrency(total)}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-white/50">Abono Acumulado</div>
                          <div className="text-sm md:text-base font-semibold text-emerald-400">{formatCurrency(cobrado)}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-white/50">Pendiente</div>
                          <div className="text-sm md:text-base font-bold text-rose-400">{formatCurrency(pendiente)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-white/60 mb-1.5">
                        <span>Progreso de cobro ({porcentaje}%)</span>
                        {factura.cronograma_vencimientos.plazos_obligatorios_atender && (
                          <span className="text-[#f5c451]">
                            Abonos restantes pendientes: {factura.cronograma_vencimientos.abonos_restantes_pendientes}
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8] transition-all duration-500"
                          style={{ width: `${Math.max(0, porcentaje)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Próximo vencimiento y acciones */}
                    <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-white/70">
                        {factura.cronograma_vencimientos.proximo_abono_obligatorio ? (
                          <span>
                            Fecha del próximo abono obligatorio:{' '}
                            <strong className="text-white">
                              {formatDateES(factura.cronograma_vencimientos.proximo_abono_obligatorio.fecha_vencimiento)}
                            </strong>{' '}
                            ({formatCurrency(factura.cronograma_vencimientos.proximo_abono_obligatorio.importe_cuota)})
                          </span>
                        ) : (
                          <span className="text-emerald-400/90">Sin vencimientos pendientes de cobro</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {factura.estado_gestion_cobros.estado_pago !== 'COBRADA_TOTAL' && (
                          <button
                            onClick={() => {
                              setSelectedFactura(factura);
                              setAbonoImporte(
                                factura.cronograma_vencimientos.proximo_abono_obligatorio
                                  ? factura.cronograma_vencimientos.proximo_abono_obligatorio.importe_cuota.toString()
                                  : factura.estado_gestion_cobros.importe_pendiente_abono.toString()
                              );
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-1.5 rounded-lg border border-white/15 transition-all text-xs"
                          >
                            Registrar Abono
                          </button>
                        )}
                        <button
                          onClick={() => abrirReciboMinimalista(factura, 0)}
                          className="bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg border border-white/15 transition-all text-xs flex items-center gap-1.5"
                        >
                          <span>💶 Ver Recibo ({factura.historial_pagos_recibidos.length})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: FACTURAS EMITIDAS */}
        {activeTab === 'emitidas' && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit']">Facturas Emitidas</h1>
                <p className="text-xs md:text-sm text-white/60">
                  Facturas Ordinarias, de Anticipo y Rectificativas oficiales (BOE Real Decreto 1619/2012). Formato minimalista unificado con icono flotante.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto bg-[#0e0c1d] border border-white/8 rounded-2xl">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-white/50 text-[11px] uppercase tracking-wider">
                    <th className="p-4">Nº Factura</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Base Imponible</th>
                    <th className="p-4">IVA (21%)</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {facturasEmitidas.map(f => (
                    <tr key={f.factura_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-medium text-white">{f.factura_id}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          f.tipo_documento === 'RECTIFICATIVA'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            : 'bg-white/5 text-white/70'
                        }`}>
                          {f.tipo_documento}
                        </span>
                      </td>
                      <td className="p-4 text-white/70">{formatDateES(f.fecha_emision)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-medium text-white/90">{f.cliente.razon_social}</div>
                            <div className="text-[11px] text-white/40">{f.cliente.cif_nif}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {f.cliente.telefono && (
                              <a
                                href={`tel:${f.cliente.telefono}`}
                                title={`Llamar a ${f.cliente.telefono}`}
                                className="text-white/40 hover:text-emerald-400 transition-colors"
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                              </a>
                            )}
                            {f.cliente.email && (
                              <a
                                href={`mailto:${f.cliente.email}`}
                                title={`Enviar correo a ${f.cliente.email}`}
                                className="text-white/40 hover:text-sky-400 transition-colors"
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                              </a>
                            )}
                            {/* Botón flotante eliminar cliente: cubo de basura, sin relleno, sin envoltorio */}
                            <button
                              type="button"
                              onClick={() => {
                                showNotice(`🗑️ Cliente ${f.cliente.razon_social} eliminado.`);
                              }}
                              title="Eliminar cliente"
                              aria-label="Eliminar cliente"
                              className="text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white/70">{formatCurrency(f.totales_operacion.base_imponible_total)}</td>
                      <td className="p-4 text-white/70">{formatCurrency(f.totales_operacion.cuota_iva_total)}</td>
                      <td className="p-4 text-right font-bold text-white">{formatCurrency(f.totales_operacion.importe_total_factura)}</td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          f.estado_gestion_cobros.estado_pago === 'COBRADA_TOTAL'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {f.estado_gestion_cobros.estado_pago === 'COBRADA_TOTAL' ? 'Cobrada' : 'Parcial'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => abrirFacturaMinimalista(f)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all flex items-center gap-1 mx-auto"
                        >
                          <span>VER</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: FACTURAS RECIBIDAS */}
        {activeTab === 'recibidas' && (
          <section className="space-y-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-['Outfit']">Facturas Recibidas</h1>
              <p className="text-xs md:text-sm text-white/60">Gastos, proveedores y cuotas de IVA deducible para la AEAT.</p>
            </div>

            <div className="overflow-x-auto bg-[#0e0c1d] border border-white/8 rounded-2xl">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-white/50 text-[11px] uppercase tracking-wider">
                    <th className="p-4">Referencia</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Proveedor</th>
                    <th className="p-4">Base Deducible</th>
                    <th className="p-4">IVA Deducible</th>
                    <th className="p-4 text-right">Total Factura</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {facturasRecibidas.map(f => (
                    <tr key={f.factura_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-medium text-white">{f.factura_id}</td>
                      <td className="p-4 text-white/70">{formatDateES(f.fecha_emision)}</td>
                      <td className="p-4">
                        <div className="font-medium text-white/90">{f.cliente.razon_social}</div>
                        <div className="text-[11px] text-white/40">{f.cliente.cif_nif}</div>
                      </td>
                      <td className="p-4 text-white/70">{formatCurrency(f.totales_operacion.base_imponible_total)}</td>
                      <td className="p-4 text-white/70">{formatCurrency(f.totales_operacion.cuota_iva_total)}</td>
                      <td className="p-4 text-right font-bold text-white">{formatCurrency(f.totales_operacion.importe_total_factura)}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => abrirFacturaMinimalista(f)}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-semibold text-xs transition-all flex items-center gap-1 mx-auto"
                        >
                          <span>VER</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: PRESUPUESTOS Y RECEPCIÓN TÉCNICA */}
        {activeTab === 'presupuestos' && (
          <section className="space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-['Outfit']">Presupuestos y Recepción Técnica</h1>
              <p className="text-xs md:text-sm text-white/60">
                Recepción técnica, partes de trabajo e imágenes iniciales. Diseño minimalista con bordes coloreados según estado y visor oficial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {presupuestos.map(p => {
                const isAceptado = p.estado === 'ACEPTADO';
                const borderColor = isAceptado ? 'border-emerald-500/40 shadow-[0_0_20px_-8px_rgba(34,197,94,0.3)]' : 'border-sky-500/30 shadow-[0_0_20px_-8px_rgba(56,189,248,0.25)]';
                return (
                  <div key={p.presupuesto_id} className={`relative bg-[#0e0c1d] border ${borderColor} rounded-2xl p-5 space-y-4 transition-all hover:border-white/30`}>
                    {/* Icono Minimalista Flotante en la esquina superior (Sin Relleno) */}
                    <div className="absolute top-4 right-4 text-white/20">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                    </div>

                    <div className="flex justify-between items-start pr-10">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-white">{p.presupuesto_id}</span>
                          {p.solicitud_id && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {p.solicitud_id}
                            </span>
                          )}
                          {p.expediente_id && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {p.expediente_id}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-1">
                          <div>
                            <div className="text-sm font-semibold text-white/90">{p.cliente.razon_social}</div>
                            <div className="text-xs text-white/50">{p.cliente.cif_nif}</div>
                          </div>
                          {/* Iconos de la tarjeta de cliente: Llamar, WhatsApp, Email y Eliminar cliente */}
                          <div className="flex items-center gap-2">
                            {p.cliente.telefono && (
                              <a
                                href={`tel:${p.cliente.telefono}`}
                                title={`Llamar a ${p.cliente.telefono}`}
                                className="text-white/40 hover:text-emerald-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                              </a>
                            )}
                            {p.cliente.telefono && (
                              <a
                                href={`https://wa.me/${p.cliente.telefono.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Enviar WhatsApp"
                                className="text-white/40 hover:text-emerald-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                              </a>
                            )}
                            {p.cliente.email && (
                              <a
                                href={`mailto:${p.cliente.email}`}
                                title={`Enviar correo a ${p.cliente.email}`}
                                className="text-white/40 hover:text-sky-400 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                              </a>
                            )}
                            {/* Botón flotante eliminar cliente: cubo de basura, sin relleno, sin envoltorio */}
                            <button
                              type="button"
                              onClick={() => {
                                showNotice(`🗑️ Cliente ${p.cliente.razon_social} eliminado de la tarjeta de presupuesto.`);
                              }}
                              title="Eliminar cliente"
                              aria-label="Eliminar cliente"
                              className="text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        isAceptado ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}>
                        {p.estado}
                      </span>
                    </div>

                    {p.vehiculo_o_referencia && (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-white/50">Vehículo:</span>
                            <span className="text-white font-semibold">{p.vehiculo_o_referencia.marca_modelo}</span>
                          </div>
                          <span className="font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/10 tracking-wider">
                            {p.vehiculo_o_referencia.matricula_o_id}
                          </span>
                        </div>
                        <p className="text-white/60">{p.vehiculo_o_referencia.descripcion_trabajo}</p>
                        
                        <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[11px]">
                          <span className="text-amber-300/70">Fecha Propuesta Entrega:</span>
                          <span className="text-amber-300 font-mono font-bold">14/10/2026</span>
                        </div>

                        {/* Imágenes de Recepción */}
                        {p.vehiculo_o_referencia.fotos_recepcion.length > 0 && (
                          <div className="pt-2">
                            <div className="text-[11px] text-white/50 mb-1.5 font-medium">Imágenes iniciales de constancia:</div>
                            <div className="flex gap-2">
                              {p.vehiculo_o_referencia.fotos_recepcion.map((foto, idx) => (
                                <img
                                  key={idx}
                                  src={foto}
                                  alt="Recepción"
                                  className="w-24 h-16 object-cover rounded-lg border border-white/10"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 pt-2 border-t border-white/6">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-white/50">Importe Estimado (IVA inc.):</div>
                        <div className="text-base font-bold text-amber-300 font-mono">{formatCurrency(p.total_estimado)}</div>
                      </div>

                      {/* Nota técnica de facturación y Botón VER Presupuesto */}
                      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-[11px] text-amber-300/90 leading-tight">
                        ℹ️ <strong>Facturación reglada:</strong> Este presupuesto no se puede convertir directamente a factura. La factura final se activará en el Roadmap al finalizar los trabajos de taller.
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => abrirPresupuestoMinimalista(p)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white font-semibold text-xs shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                        >
                          <span>📄 Ver Presupuesto Minimalista</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 5: MÓDULO AVANZADO DE NÓMINAS Y SEGURIDAD SOCIAL (BLOQUE 4) */}
        {activeTab === 'nominas' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit']">Nóminas & Seguridad Social (Tablas 2026)</h1>
                <p className="text-xs md:text-sm text-white/60 mt-0.5">
                  Organismos oficiales: TGSS (cotizaciones), SEPE (contratos) y AEAT (retenciones IRPF).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsModalAltaEmpleadoOpen(true)}
                  className="bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5"
                >
                  <span>👤+ Dar de Alta Empleado</span>
                </button>
                {activePlan === 'PRO' ? (
                  <button
                    onClick={() => handleEnviarAGestoria('nominas')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>📨 Enviar a la Gestoría</span>
                  </button>
                ) : (
                  <span className="text-xs text-[#c4b5fd] bg-[#6366f1]/20 px-2.5 py-1.5 rounded-xl border border-[#6366f1]/30">
                    Modo Enterprise Activo
                  </span>
                )}
              </div>
            </div>

            {/* Subnavegación de Módulo Laboral */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs no-scrollbar">
              <button
                onClick={() => setSubtabNomina('general')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  subtabNomina === 'general' ? 'bg-white/15 text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                📋 Cuadro de Nóminas
              </button>
              <button
                onClick={() => setSubtabNomina('scanner')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  subtabNomina === 'scanner' ? 'bg-[#38bdf8]/20 text-[#7dd3fc] font-bold border border-[#38bdf8]/40' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>📧 Escáner Correo Gestoría</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </button>
              <button
                onClick={() => setSubtabNomina('gestoria')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  subtabNomina === 'gestoria' ? 'bg-white/15 text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                📤 Transmisión a Gestoría
              </button>
              <button
                onClick={() => setSubtabNomina('fichajes')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  subtabNomina === 'fichajes' ? 'bg-[#a855f7]/20 text-[#d8b4fe] font-bold border border-[#a855f7]/40' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>⏱️ Control Horario & Fichajes</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">€</span>
              </button>
              <button
                onClick={() => setSubtabNomina('empleados')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  subtabNomina === 'empleados' ? 'bg-white/15 text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                👥 Empleados Autorizados ({empleadosAutorizados.length})
              </button>
            </div>

            {/* Banner de confirmación si se acaba de dar de alta a un empleado */}
            {ultimoEnlaceEnviado && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <span>📲 Alta Registrada: Enlace de Instalación Transmitido</span>
                  </div>
                  <button onClick={() => setUltimoEnlaceEnviado(null)} className="text-white/40 hover:text-white">&times;</button>
                </div>
                <p className="text-white/80 text-[11px]">
                  El empleado <strong>{ultimoEnlaceEnviado.nombre}</strong> ha recibido las instrucciones y enlace para instalar y acceder a la aplicación en su smartphone:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
                      <span>📧 Enviado por Email a:</span>
                      <strong className="text-white font-mono">{ultimoEnlaceEnviado.email}</strong>
                    </div>
                    <span className="text-emerald-400 font-medium">✓ Notificación y enlace de descarga enviados</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <span>💬 Enviado por WhatsApp a:</span>
                      <strong className="text-white font-mono">{ultimoEnlaceEnviado.telefono}</strong>
                    </div>
                    <span className="text-emerald-400 font-medium">✓ Enlace directo para descarga inmediata en móvil</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-white/50">Enlace de descarga directa:</span>
                  <input
                    type="text"
                    readOnly
                    value={ultimoEnlaceEnviado.enlace}
                    className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-white/90 font-mono text-[10px] w-80 max-w-full"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ultimoEnlaceEnviado.enlace);
                      showNotice('Enlace copiado al portapapeles');
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                  >
                    Copiar Enlace
                  </button>
                </div>
              </div>
            )}

            {/* SUBTAB 1: CUADRO DE NÓMINAS */}
            {subtabNomina === 'general' && (
              <div className="space-y-6">
                <div className="overflow-x-auto bg-[#0e0c1d] border border-white/8 rounded-2xl">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-white/50 text-[11px] uppercase tracking-wider">
                        <th className="p-4">Empleado & Puesto</th>
                        <th className="p-4">Grupo SS (2026)</th>
                        <th className="p-4">Bruto Devengado</th>
                        <th className="p-4">SS Trabajador</th>
                        <th className="p-4">IRPF a Cuenta</th>
                        <th className="p-4">Líquido Neto</th>
                        <th className="p-4 text-right">Coste Total Empresa</th>
                        <th className="p-4 text-center">Documento Oficial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {nominasCalculadas.map(nom => {
                        const grupoInfo = GRUPOS_COTIZACION_2026[nom.grupoCotizacion];
                        return (
                          <tr key={nom.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="font-semibold text-white">{nom.empleadoNombre}</div>
                              <div className="text-[11px] text-white/40">{nom.empleadoNif}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-mono text-xs text-purple-300 font-bold">G{nom.grupoCotizacion}</div>
                              <div className="text-[10px] text-white/50 max-w-[160px] truncate">{grupoInfo?.categoria}</div>
                            </td>
                            <td className="p-4 font-mono text-white">{formatCurrency(nom.totalDevengadoBruto)}</td>
                            <td className="p-4 font-mono text-amber-300">-{formatCurrency(nom.deduccionesTrabajador.totalAportacionSeguridadSocial)}</td>
                            <td className="p-4 font-mono text-rose-300">-{formatCurrency(nom.deduccionesTrabajador.retencionIrpf)}</td>
                            <td className="p-4 font-mono font-bold text-emerald-400">{formatCurrency(nom.liquidoTotalAPercibir)}</td>
                            <td className="p-4 text-right font-mono font-semibold text-white/90">{formatCurrency(nom.costeTotalEmpresa)}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setModalNominaActiva(nom)}
                                  className="bg-[#6366f1]/20 hover:bg-[#6366f1]/35 border border-[#6366f1]/40 text-[#c4b5fd] text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                  title="Ver documento oficial de nómina"
                                >
                                  <span>👁️ VER</span>
                                </button>
                                <button
                                  onClick={() => setModalNominaActiva(nom)}
                                  className="bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300 font-bold text-xs w-7 h-7 rounded-lg transition-all flex items-center justify-center"
                                  title="Icono de retribuciones: Ver Recibo Individual de Salarios"
                                >
                                  €
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mapeo Oficial por Grupo de Cotización 2026 */}
                <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2">Bases Oficiales de Cotización 2026 (Orden PJC/297/2026)</h3>
                  <p className="text-xs text-white/50 mb-3">
                    Base máxima general: 5.101,20 €/mes (170,04 €/día). Topes mínimos garantizados según los 11 grupos oficiales de la TGSS.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.values(GRUPOS_COTIZACION_2026).map(g => (
                      <div key={g.grupo} className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                        <span className="font-bold text-purple-300">Grupo {g.grupo}:</span> {g.categoria}
                        <div className="text-[11px] text-white/50 mt-1">
                          Base mínima: {formatCurrency(g.baseMinimaMesOdia)} {g.tipoCotizacion === 'DIARIA' ? '/día' : '/mes'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: ESCÁNER DE CORREO ENTRANTE PARA NÓMINAS */}
            {subtabNomina === 'scanner' && (
              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Escáner de Correo Entrante (Nóminas de Gestoría Externa)</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Monitorea automáticamente la bandeja de entrada para detectar y sincronizar nóminas selladas en PDF enviadas por su asesoría.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScannerAutoActivo(!scannerAutoActivo)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                        scannerAutoActivo ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-white/60 border-white/10'
                      }`}
                    >
                      {scannerAutoActivo ? '✓ Escáner Automático ACTIVO' : 'Escáner en Pausa'}
                    </button>
                    <button
                      onClick={handleEscanearCorreoAhora}
                      disabled={isEscaneandoCorreo}
                      className="bg-[#38bdf8] hover:bg-[#38bdf8]/85 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <span>{isEscaneandoCorreo ? 'Escaneando IMAP...' : '🔄 Escanear Bandeja Ahora'}</span>
                    </button>
                  </div>
                </div>

                {/* Lista de remesas y correos detectados */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-white/80">Remesas Detectadas y Procesadas Automáticamente:</div>
                  {correosNominas.map(correo => (
                    <div key={correo.id} className="bg-white/[0.02] border border-white/8 rounded-xl p-4 text-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-sm">{correo.asunto}</div>
                          <div className="text-white/50 text-[11px]">
                            Remitente: <strong className="text-white">{correo.remitente}</strong> · Recibido: {correo.fechaRecepcion}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono bg-purple-500/15 text-purple-300 px-2.5 py-1 rounded border border-purple-500/30">
                            📎 {correo.nombreFicheroPdf} ({correo.tamanoFichero})
                          </span>
                          <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                            {correo.estadoProcesado}
                          </span>
                        </div>
                      </div>

                      <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-1.5">
                        <div className="text-[11px] text-white/60 font-semibold">Nóminas Extraídas y Cruzadas con Plantilla:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {correo.empleadosDetectados.map(emp => (
                            <div key={emp.nif} className="p-2 bg-white/[0.02] rounded border border-white/5 text-[11px]">
                              <div className="font-semibold text-white">{emp.nombre}</div>
                              <div className="text-white/40">{emp.nif}</div>
                              <div className="flex justify-between pt-1 text-white/80">
                                <span>Bruto: <strong>{formatCurrency(emp.bruto)}</strong></span>
                                <span className="text-emerald-400 font-bold">Neto: {formatCurrency(emp.liquidoNeto)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: TRANSMISIÓN DE DATOS A LA GESTORÍA */}
            {subtabNomina === 'gestoria' && (
              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">Envío y Transmisión de Datos a la Gestoría</h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Para los empresarios que externalizan la confección de nóminas: envíe las horas efectivas desde el control horario, datos fijos preprogramados o incidencias manuales.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setDatosEnvioGestoria(prev => ({ ...prev, modo: 'HORAS_CONTROL' }))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      datosEnvioGestoria.modo === 'HORAS_CONTROL'
                        ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm text-purple-300">1. Horas desde Control Horario</div>
                    <p className="text-[11px] mt-1 text-white/70">
                      Calcula y exporta automáticamente las horas efectivas de cada trabajador a partir de los fichajes registrados en la app.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDatosEnvioGestoria(prev => ({ ...prev, modo: 'PREPROGRAMADO' }))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      datosEnvioGestoria.modo === 'PREPROGRAMADO'
                        ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm text-blue-300">2. Datos Preprogramados Fijos</div>
                    <p className="text-[11px] mt-1 text-white/70">
                      Plantilla fija recurrente para cada mensualidad (salarios base según contrato y jornada ordinaria sin variaciones).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDatosEnvioGestoria(prev => ({ ...prev, modo: 'MANUAL' }))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      datosEnvioGestoria.modo === 'MANUAL'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm text-emerald-300">3. Introducción Manual</div>
                    <p className="text-[11px] mt-1 text-white/70">
                      Edición manual puntual de horas extras, dietas, pluses extraordinarios y bajas médicas de IT para el periodo.
                    </p>
                  </button>
                </div>

                {/* Formulario de variables según modo */}
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-3 text-xs">
                  {datosEnvioGestoria.modo === 'HORAS_CONTROL' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white">Horas Totales Computadas desde Fichajes:</span>
                        <span className="font-mono text-purple-300 font-bold text-sm">
                          {fichajes.filter(f => f.estado === 'COMPLETADA').reduce((a, b) => a + b.horasEfectivas, 0).toFixed(1)} horas registradas
                        </span>
                      </div>
                      <p className="text-white/60 text-[11px]">
                        Los fichajes del sistema de control horario se compilarán en un archivo estructurado compatible con los programas de nóminas de gestorías (A3Innuva, Sage Despachos, Wolters Kluwer).
                      </p>
                    </div>
                  )}

                  {datosEnvioGestoria.modo === 'PREPROGRAMADO' && (
                    <div className="space-y-2">
                      <div className="text-white/80 font-semibold">Configuración de Envío Recurrente:</div>
                      <p className="text-white/60 text-[11px]">
                        Día de envío fijado: <strong>25 de cada mes</strong>. Se transmiten los salarios contractuales de los {empleados.length} empleados en activo sin necesidad de intervención manual.
                      </p>
                    </div>
                  )}

                  {datosEnvioGestoria.modo === 'MANUAL' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-white/60 block mb-1">Horas extraordinarias acumuladas:</label>
                        <input
                          type="number"
                          step="0.5"
                          value={datosEnvioGestoria.horasExtras}
                          onChange={(e) => setDatosEnvioGestoria(prev => ({ ...prev, horasExtras: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 block mb-1">Dietas y desplazamientos (€):</label>
                        <input
                          type="number"
                          step="10"
                          value={datosEnvioGestoria.dietas}
                          onChange={(e) => setDatosEnvioGestoria(prev => ({ ...prev, dietas: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-white/60 block mb-1">Observaciones / Incidencias de IT para el asesor:</label>
                    <textarea
                      rows={2}
                      value={datosEnvioGestoria.incidencias}
                      onChange={(e) => setDatosEnvioGestoria(prev => ({ ...prev, incidencias: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleEnviarDatosAGestoriaConModo}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <span>📨 Transmitir Fichero Oficial a la Gestoría</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: CONTROL HORARIO Y FICHAJES (ÁREA EMPLEADO AUTORIZADO) */}
            {subtabNomina === 'fichajes' && (
              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Control Horario de Jornada Laboral (Real Decreto-ley 8/2019)</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Área de Empleado
                      </span>
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Fichaje obligatorio de entrada y salida para iniciar y finalizar la jornada laboral. Grabación fehaciente de horas efectivas.
                    </p>
                  </div>

                  {/* Selector de Empleado que está fichando */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50">Empleado Activo:</span>
                    <select
                      value={empleadoActivoFichajeId}
                      onChange={(e) => setEmpleadoActivoFichajeId(e.target.value)}
                      className="bg-[#16142a] border border-white/15 text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
                    >
                      {empleados.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre} {emp.apellidos} ({emp.puesto})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tarjeta de Fichaje Interactivo */}
                {(() => {
                  const empActual = empleados.find(e => e.id === empleadoActivoFichajeId) || empleados[0];
                  const fichajeEnCurso = fichajes.find(f => f.empleadoId === empActual.id && f.estado === 'EN_CURSO');
                  const nominaEmp = nominasCalculadas.find(n => n.empleadoNif === empActual.nif) || nominasCalculadas[0];

                  return (
                    <div className="bg-gradient-to-r from-purple-950/20 via-black/40 to-black/20 border border-purple-500/30 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                            {empActual.nombre[0]}
                          </div>
                          <div>
                            <div className="text-base font-bold text-white flex items-center gap-2">
                              <span>{empActual.nombre} {empActual.apellidos}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                fichajeEnCurso
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                                  : 'bg-white/10 text-white/50'
                              }`}>
                                {fichajeEnCurso ? '● JORNADA EN CURSO' : '○ FUERA DE JORNADA'}
                              </span>
                            </div>
                            <div className="text-xs text-white/50">
                              {empActual.puesto} · NIF: <span className="font-mono text-white/70">{empActual.nif}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botón de acceso a sus retribuciones y nómina con icono de euro */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setModalNominaActiva(nominaEmp)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                            title="Consultar nómina mensual oficial del trabajador"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center font-bold text-xs">€</span>
                            <span>Ver Mis Retribuciones (Nómina)</span>
                          </button>
                        </div>
                      </div>

                      {/* Botonera de Fichaje */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {!fichajeEnCurso ? (
                          <button
                            onClick={handleFicharEntrada}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <span>▶ Fichar Entrada (Iniciar Jornada)</span>
                          </button>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 col-span-2">
                            <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl p-3 flex justify-between items-center text-xs">
                              <div>
                                <span className="text-white/50 block">Entrada registrada a las:</span>
                                <strong className="text-emerald-400 font-mono text-base">{fichajeEnCurso.horaEntrada} h</strong>
                              </div>
                              <div className="text-right">
                                <label className="text-white/50 block text-[11px]">Pausa comida/descanso (min):</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="5"
                                  value={pausaFichajeMinutos}
                                  onChange={(e) => setPausaFichajeMinutos(parseInt(e.target.value) || 0)}
                                  className="w-20 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white font-mono text-xs text-right"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleFicharSalida(fichajeEnCurso)}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm shrink-0"
                            >
                              <span>■ Fichar Salida (Finalizar y Grabar)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Historial de Fichajes Registrados */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-white/80">Registro de Jornadas Grabadas (Inspección de Trabajo):</div>
                  <div className="overflow-x-auto bg-[#0a0914] border border-white/5 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-white/50 text-[11px] uppercase">
                          <th className="p-3">ID Registro</th>
                          <th className="p-3">Empleado</th>
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Entrada</th>
                          <th className="p-3">Salida</th>
                          <th className="p-3">Pausas</th>
                          <th className="p-3">Horas Efectivas</th>
                          <th className="p-3">Ubicación</th>
                          <th className="p-3 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {fichajes.map(f => (
                          <tr key={f.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-mono text-white/50 text-[11px]">{f.id}</td>
                            <td className="p-3 font-semibold text-white">{f.empleadoNombre}</td>
                            <td className="p-3 text-white/70">{formatDateES(f.fecha)}</td>
                            <td className="p-3 font-mono text-emerald-400 font-bold">{f.horaEntrada}</td>
                            <td className="p-3 font-mono text-rose-300">{f.horaSalida || '--:--'}</td>
                            <td className="p-3 text-white/60">{f.pausasMinutos} min</td>
                            <td className="p-3 font-mono text-purple-300 font-bold">
                              {f.horasEfectivas > 0 ? `${f.horasEfectivas} h` : 'En cómputo'}
                            </td>
                            <td className="p-3 text-white/50 text-[11px]">{f.ubicacion}</td>
                            <td className="p-3 text-right">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                f.estado === 'COMPLETADA'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              }`}>
                                {f.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 5: EMPLEADOS AUTORIZADOS & ACCESOS */}
            {subtabNomina === 'empleados' && (
              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-base font-bold text-white">Alta y Gestión de Empleados Autorizados</h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Los empleados dados de alta reciben al instante el enlace oficial para instalar y usar la aplicación por Email y WhatsApp según sus permisos.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalAltaEmpleadoOpen(true)}
                    className="bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>👤+ Dar de Alta Nuevo Empleado</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {empleadosAutorizados.map(usr => (
                    <div key={usr.id} className="bg-white/[0.02] border border-white/8 rounded-xl p-4 text-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white text-sm">{usr.nombre}</div>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 mt-1 inline-block">
                            {usr.rolAcceso}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40">Alta: {usr.fechaAlta}</span>
                      </div>

                      <div className="space-y-1 text-[11px] text-white/70">
                        <div>📧 {usr.email}</div>
                        <div>📱 {usr.telefono}</div>
                      </div>

                      <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1 text-[10px]">
                        <span className="text-white/50 block font-semibold">Permisos Habilitados:</span>
                        <div className="grid grid-cols-2 gap-1 text-white/80">
                          <div>{usr.permisos.ficharJornada ? '✓ Fichar Jornada' : '✗ Fichaje'}</div>
                          <div>{usr.permisos.verNominasPropias ? '✓ Nóminas (€)' : '✗ Nóminas'}</div>
                          <div>{usr.permisos.verPartesTrabajo ? '✓ Partes Trabajo' : '✗ Partes'}</div>
                          <div>{usr.permisos.accesoFacturacion ? '✓ Facturación' : '✗ Facturación'}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                        <span className="text-emerald-400 font-medium">✓ Enlace Email y WhatsApp Activo</span>
                        <button
                          onClick={() => {
                            const emp = empleados.find(e => e.id === usr.empleadoId) || empleados[0];
                            const nom = nominasCalculadas.find(n => n.empleadoNif === emp.nif) || nominasCalculadas[0];
                            setModalNominaActiva(nom);
                          }}
                          className="text-[#c4b5fd] hover:text-white font-semibold underline"
                        >
                          Ver Nómina (€)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Si es ENTERPRISE: Integración directa Modelo 111 y 190 */}
            {activePlan === 'ENTERPRISE' && (
              <div className="bg-[#0e0c1d] border border-[#6366f1]/30 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Modelo 111 · Retenciones IRPF del Trabajo (Trimestral)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">AEAT Oficial</span>
                    </h3>
                    <p className="text-xs text-white/50">Generado automáticamente por el motor fiscal Gestarian Enterprise.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalModeloActivo('111')}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <span>👁️ VER MODELO 111</span>
                    </button>
                    <button
                      onClick={() => handlePresentarTelematicoAEAT('111')}
                      className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition-all shadow"
                    >
                      Firmar Telemáticamente (111)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[01] Nº Perceptores</div>
                    <div className="text-base font-bold text-white mt-1">{borrador111.casilla_01_numero_perceptores}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[02] Importe Percepciones</div>
                    <div className="text-base font-bold text-white mt-1">{formatCurrency(borrador111.casilla_02_importe_percepciones)}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[03] Importe Retenciones</div>
                    <div className="text-base font-bold text-rose-400 mt-1">{formatCurrency(borrador111.casilla_03_importe_retenciones)}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[28] Total a Ingresar</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{formatCurrency(borrador111.casilla_28_total_liquidar)}</div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 6: ACTIVOS E INMUEBLES ARRENDADOS (BLOQUE 5) */}
        {activeTab === 'activos' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit']">Bienes & Alquileres Comerciales (Retención 19%)</h1>
                <p className="text-xs md:text-sm text-white/60 mt-0.5">
                  Inmovilizado material amortizable y locales afectos con retención del 19% y Referencia Catastral.
                </p>
              </div>

              {activePlan === 'PRO' ? (
                <button
                  onClick={() => handleEnviarAGestoria('activos')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
                >
                  <span>📨 Enviar a la Gestoría</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#c4b5fd] bg-[#6366f1]/20 px-2.5 py-1 rounded-lg border border-[#6366f1]/30">
                    Modo Enterprise: Modelo 115 y 180 Activo
                  </span>
                </div>
              )}
            </div>

            {/* 1. Bienes en Alquiler (Retención 19% IRPF + Catastro) */}
            <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Inmuebles en Alquiler (Retención 19% obligatoria)</h3>
              <div className="grid grid-cols-1 gap-4">
                {inmuebles.map(inm => (
                  <div key={inm.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div>
                        <div className="font-bold text-white text-sm">{inm.nombreLocal}</div>
                        <div className="text-white/50">{inm.direccionCompleta}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
                          Catastro: {inm.referenciaCatastral}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-white/50 block">Arrendador:</span>
                        <strong className="text-white">{inm.arrendador.razonSocial}</strong>
                        <div className="text-white/40">{inm.arrendador.nifCif}</div>
                      </div>
                      <div>
                        <span className="text-white/50 block">Base Imponible:</span>
                        <span className="font-mono text-white font-bold">{formatCurrency(inm.baseImponibleMensual)}</span>
                      </div>
                      <div>
                        <span className="text-white/50 block">Retención IRPF (19%):</span>
                        <span className="font-mono text-rose-400 font-bold">-{formatCurrency(inm.retencionMensual)}</span>
                      </div>
                      <div>
                        <span className="text-white/50 block">Total a Pagar Arrendador:</span>
                        <span className="font-mono text-emerald-400 font-bold">{formatCurrency(inm.totalFacturaPagarMensual)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Bienes en Propiedad (Amortización lineal AEAT) */}
            <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Inmovilizado Material en Propiedad (Amortizaciones AEAT)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/8 text-white/50 text-[11px] uppercase">
                      <th className="pb-3">Código & Activo</th>
                      <th className="pb-3">Categoría</th>
                      <th className="pb-3">Fecha Compra</th>
                      <th className="pb-3">Valor Adquisición</th>
                      <th className="pb-3">Coef. AEAT</th>
                      <th className="pb-3">Cuota Anual</th>
                      <th className="pb-3">Amort. Acumulada</th>
                      <th className="pb-3 text-right">Valor Neto Contable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activos.map(act => (
                      <tr key={act.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-semibold text-white">{act.nombre}</td>
                        <td className="py-3 text-white/60">{act.categoria}</td>
                        <td className="py-3 text-white/60">{formatDateES(act.fechaAdquisicion)}</td>
                        <td className="py-3 font-mono text-white">{formatCurrency(act.valorAdquisicion)}</td>
                        <td className="py-3 font-mono text-purple-300">{act.coeficienteAmortizacionAnual}%</td>
                        <td className="py-3 font-mono text-white/80">{formatCurrency(act.cuotaAnual)}</td>
                        <td className="py-3 font-mono text-amber-300">{formatCurrency(act.amortizacionAcumulada)}</td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(act.valorNetoContable)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modelos Fiscales de Arrendamientos: Modelo 115 (Trimestral) y Modelo 180 (Resumen Anual) */}
            <div className="space-y-4">
              {/* Modelo 115 Trimestral */}
              <div className="bg-[#0e0c1d] border border-[#6366f1]/30 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Modelo 115 · Retenciones por Arrendamiento Urbano (Trimestral 4T)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">Tipo Oficial 19,00%</span>
                    </h3>
                    <p className="text-xs text-white/50">Autorellenado directo a ingresar en la AEAT sobre las naves y locales comerciales afectos.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalModeloActivo('115')}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <span>👁️ VER MODELO 115 OFICIAL</span>
                    </button>
                    {activePlan === 'ENTERPRISE' && (
                      <button
                        onClick={() => handlePresentarTelematicoAEAT('115')}
                        className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition-all"
                      >
                        Firmar Telemáticamente (115)
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[01] Nº Arrendadores</div>
                    <div className="text-base font-bold text-white mt-1">{borrador115.casilla_01_numero_perceptores}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[02] Base Retenciones</div>
                    <div className="text-base font-bold text-white mt-1">{formatCurrency(borrador115.casilla_02_base_retenciones)}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[03] Retenciones (19%)</div>
                    <div className="text-base font-bold text-rose-400 mt-1">{formatCurrency(borrador115.casilla_03_importe_retenciones)}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">[05] Total a Ingresar</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{formatCurrency(borrador115.casilla_05_total_ingresar)}</div>
                  </div>
                </div>
              </div>

              {/* Modelo 180 Resumen Anual con Explicación de Bloqueo / Calendario AEAT */}
              <div className="bg-[#0e0c1d] border border-amber-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Modelo 180 · Resumen Anual Informativo de Arrendamientos Urbanos</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                        <span>🔒 Informativo Anual</span>
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      Declaración anual que vincula las retenciones acumuladas con la Referencia Catastral de cada inmueble.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalModeloActivo('180')}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <span>👁️ VER MODELO 180 OFICIAL</span>
                    </button>
                    {activePlan === 'ENTERPRISE' && (
                      <button
                        onClick={() => {
                          if (!simulacionPeriodoAnual180) {
                            showNotice('El Modelo 180 se habilita para firma del 1 al 31 de enero tras concluir el 4T. Puedes inspeccionar el borrador oficial con el botón "VER".');
                          } else {
                            handlePresentarTelematicoAEAT('180');
                          }
                        }}
                        className={`text-xs px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                          simulacionPeriodoAnual180
                            ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/80'
                            : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                        }`}
                      >
                        {simulacionPeriodoAnual180 ? 'Firmar Telemáticamente (180)' : '🔒 Plazo: 1-31 Enero'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Caja Explicativa Oficial: ¿Por qué es un resumen anual y por qué tiene bloqueo? */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-2">
                    <span>📌 ¿Por qué el Modelo 180 es un Resumen Anual y no se liquida cada trimestre?</span>
                  </div>
                  <p className="text-white/85 text-[11px] leading-relaxed">
                    El <strong>Modelo 180</strong> no es una autoliquidación con ingreso de dinero (las retenciones del 19% ya se ingresan trimestralmente en el Modelo 115). Se trata de una <strong>Declaración Informativa Anual</strong> obligatoria por el calendario de la AEAT, cuyo plazo legal de presentación es exclusivamente <strong>del 1 al 31 de enero del ejercicio posterior</strong> (ejercicio 2026 presentado en enero 2027), una vez finalizados los cuatro trimestres (1T, 2T, 3T y 4T).
                  </p>
                  <p className="text-white/70 text-[11px] leading-relaxed">
                    Su finalidad fiscal ante Hacienda es identificar de forma nominativa a cada arrendador (NIF, nombre y domicilio) y declarar de manera ineludible la <strong>Referencia Catastral</strong> oficial de cada nave o local comercial alquilado. Por este motivo, permanece en estado informativo/bloqueado durante el ejercicio y se activa al cierre del año contable.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="text-white/50">Simular período de radicación anual (enero):</span>
                    <button
                      onClick={() => setSimulacionPeriodoAnual180(!simulacionPeriodoAnual180)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        simulacionPeriodoAnual180 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {simulacionPeriodoAnual180 ? 'Modo Enero Activo (Desbloqueado)' : 'Modo Ordinario (Informativo)'}
                    </button>
                  </div>
                </div>

                {/* Resumen Anual Previsto */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">Arrendadores Afectos</div>
                    <div className="text-base font-bold text-white mt-1">{borrador180.totalArrendadores}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">Bases Anuales Acumuladas</div>
                    <div className="text-base font-bold text-white mt-1">{formatCurrency(borrador180.totalBases)}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">Retención Anual 19%</div>
                    <div className="text-base font-bold text-rose-400 mt-1">{formatCurrency(borrador180.totalRetenciones)}</div>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="text-white/50">Referencia Catastral Afecta</div>
                    <div className="text-xs font-mono font-bold text-purple-300 mt-1 truncate">{borrador180.inmueblesRegistrados[0]?.referenciaCatastral}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 7: ALERTAS INTELIGENTES "METIS" (BLOQUE 6) */}
        {activeTab === 'metis' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit'] flex items-center gap-2">
                  <span>Integrador de Alertas Fiscales y Laborales · METIS</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f5c451] animate-pulse"></span>
                </h1>
                <p className="text-xs md:text-sm text-white/60 mt-0.5">
                  Monitor proactivo y reactivo de vencimientos, cobros, contratos SEPE y plazos tributarios de la AEAT.
                </p>
              </div>

              {activePlan === 'PRO' && (
                <button
                  onClick={() => handleEnviarAGestoria('consolidado')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
                >
                  <span>📨 Enviar Consolidado Fiscal a Gestoría</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {alertasMetis.map(alerta => (
                <div
                  key={alerta.id}
                  className={`p-4 md:p-5 rounded-2xl border transition-all ${
                    alerta.prioridad === 'CRITICA'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : alerta.prioridad === 'AVISO'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/[0.02] border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          alerta.prioridad === 'CRITICA'
                            ? 'bg-rose-500/20 text-rose-300'
                            : alerta.prioridad === 'AVISO'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {alerta.tipo}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{alerta.titulo}</h4>
                      </div>
                      <p className="text-xs text-white/70">{alerta.mensaje}</p>
                    </div>

                    {alerta.accionRecomendada && (
                      <button
                        onClick={() => {
                          setActiveTab(alerta.accionRecomendada!.targetTab as TabKey);
                          showNotice(`Navegando a ${alerta.accionRecomendada!.label}`);
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-1.5 rounded-xl border border-white/15 text-xs self-start sm:self-auto transition-all shrink-0"
                      >
                        {alerta.accionRecomendada.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 8: PÁGINA AEAT & CERTIFICADO DIGITAL (ENTERPRISE EXCLUSIVO) */}
        {activeTab === 'aeat' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit'] flex items-center gap-2">
                  <span>Página AEAT · Conexión Tributaria y Firma Oficial</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#6366f1]/20 text-[#c4b5fd] border border-[#6366f1]/30">
                    ENTERPRISE
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-white/60 mt-0.5">
                  Autorellenado telemático de Modelos 303, 111, 115, 190 y 180 con Certificado Digital local Forge.
                </p>
              </div>
            </div>

            {/* Restricción estricta Bloque 8 si no es Enterprise */}
            {activePlan !== 'ENTERPRISE' ? (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center space-y-3">
                <div className="text-2xl">🔒</div>
                <h3 className="text-base font-bold text-white">Función Bloqueada en Plan {activePlan}</h3>
                <p className="text-xs text-rose-300 max-w-lg mx-auto">
                  Esta funcionalidad de comunicación directa con la AEAT requiere actualizar su suscripción al Plan Enterprise.
                </p>
                <button
                  onClick={() => {
                    setActivePlan('ENTERPRISE');
                    showNotice('Suscripción actualizada a GESTARIAN ENTERPRISE');
                  }}
                  className="bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:opacity-95 transition-opacity"
                >
                  Actualizar a Enterprise
                </button>
              </div>
            ) : (
              <>
                {/* Certificado Digital PKCS#12 con Forge */}
                <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 md:p-6 space-y-4">
                  <h2 className="text-base font-semibold text-white">Certificado Digital (FNMT / DNIe)</h2>
                  <p className="text-xs text-white/60">
                    Desencriptación local en tu navegador mediante librería criptográfica Forge.
                  </p>

                  {certInfo ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Certificado Activo y Vinculado con Sede Electrónica</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-white/80 pt-1">
                        <div>Titular: <strong className="text-white">{certInfo.titular}</strong></div>
                        <div>NIF/CIF: <strong className="text-white">{certInfo.nif}</strong></div>
                        <div>Válido hasta: <strong className="text-white">{certInfo.validoHasta}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCargarCertificado} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <input
                        type="file"
                        accept=".p12,.pfx"
                        onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                        className="text-xs text-white/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"
                      />
                      <input
                        type="password"
                        placeholder="Contraseña del certificado"
                        value={certPassword}
                        onChange={(e) => setCertPassword(e.target.value)}
                        className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/40 focus:outline-none focus:border-[#6366f1]"
                      />
                      <button
                        type="submit"
                        disabled={certLoading}
                        className="bg-[#6366f1] hover:bg-[#6366f1]/80 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all"
                      >
                        {certLoading ? 'Validando...' : 'Incorporar Certificado'}
                      </button>
                      {certError && <span className="text-rose-400 text-xs">{certError}</span>}
                    </form>
                  )}
                </div>

                {/* Resumen Agregado de Modelos Fiscales Oficiales con Botón VER */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Modelo 303 (IVA) */}
                  <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">Modelo 303 (IVA)</h4>
                        <span className="text-[11px] text-white/50">{borrador303.periodo} 2026 · Trimestral</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#c4b5fd]">
                        {formatCurrency(borrador303.casilla_71_resultado_declaracion)}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 space-y-1">
                      <div>Base ventas: {formatCurrency(borrador303.casilla_01_base_21)}</div>
                      <div>IVA devengado: {formatCurrency(borrador303.casilla_07_total_devengado)}</div>
                      <div>IVA deducible: {formatCurrency(borrador303.casilla_45_total_deducible)}</div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModalModeloActivo('303')}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs rounded-xl font-medium transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>👁️ VER</span>
                      </button>
                      <button
                        onClick={() => handlePresentarTelematicoAEAT('303')}
                        className="flex-1 py-2 bg-[#6366f1] hover:bg-[#6366f1]/80 text-white text-xs rounded-xl font-medium transition-all"
                      >
                        Presentar (303)
                      </button>
                    </div>
                  </div>

                  {/* Modelo 111 (Nóminas) */}
                  <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">Modelo 111 (Nóminas)</h4>
                        <span className="text-[11px] text-white/50">4T 2026 · {borrador111.casilla_01_numero_perceptores} perceptores</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {formatCurrency(borrador111.casilla_28_total_liquidar)}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 space-y-1">
                      <div>Percepciones brutas: {formatCurrency(borrador111.casilla_02_importe_percepciones)}</div>
                      <div>Retenciones IRPF: {formatCurrency(borrador111.casilla_03_importe_retenciones)}</div>
                      <div>Resumen anual: Modelo 190 listo</div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModalModeloActivo('111')}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs rounded-xl font-medium transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>👁️ VER</span>
                      </button>
                      <button
                        onClick={() => handlePresentarTelematicoAEAT('111')}
                        className="flex-1 py-2 bg-[#6366f1] hover:bg-[#6366f1]/80 text-white text-xs rounded-xl font-medium transition-all"
                      >
                        Presentar (111)
                      </button>
                    </div>
                  </div>

                  {/* Modelo 115 (Alquileres) */}
                  <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">Modelo 115 (Alquileres)</h4>
                        <span className="text-[11px] text-white/50">4T 2026 · Retención 19%</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatCurrency(borrador115.casilla_05_total_ingresar)}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 space-y-1">
                      <div>Bases arrendamiento: {formatCurrency(borrador115.casilla_02_base_retenciones)}</div>
                      <div>Retenciones 19%: {formatCurrency(borrador115.casilla_03_importe_retenciones)}</div>
                      <div>Catastro: {inmuebles[0]?.referenciaCatastral}</div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModalModeloActivo('115')}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs rounded-xl font-medium transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>👁️ VER</span>
                      </button>
                      <button
                        onClick={() => handlePresentarTelematicoAEAT('115')}
                        className="flex-1 py-2 bg-[#6366f1] hover:bg-[#6366f1]/80 text-white text-xs rounded-xl font-medium transition-all"
                      >
                        Presentar (115)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resúmenes Anuales AEAT: Modelo 180 y Modelo 190 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Modelo 180 (Resumen Anual Arrendamientos Urbanos) */}
                  <div className="bg-[#0e0c1d] border border-amber-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Modelo 180 (Resumen Anual Alquileres)</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            🔒 1-31 Enero
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50">Declaración informativa anual obligatoria con Referencias Catastrales</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {formatCurrency(borrador180.totalRetenciones)}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/70 leading-relaxed bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      <strong>¿Por qué es un Resumen Anual?</strong> El Modelo 180 no recauda tributos trimestrales (se ingresan en el Modelo 115 al 19%), sino que relaciona de forma nominativa a todos los arrendadores con la Referencia Catastral oficial de cada nave o local. Plazo oficial AEAT: 1 al 31 de enero del ejercicio posterior.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModalModeloActivo('180')}
                        className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs rounded-xl font-medium transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>👁️ VER MODELO 180 OFICIAL</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!simulacionPeriodoAnual180) {
                            showNotice('Modelo 180 informativo: El plazo legal de radicación en la AEAT es del 1 al 31 de enero tras cerrar el año.');
                          } else {
                            handlePresentarTelematicoAEAT('180');
                          }
                        }}
                        className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs rounded-xl font-medium transition-all"
                      >
                        {simulacionPeriodoAnual180 ? 'Firmar (180)' : 'Plazo Enero'}
                      </button>
                    </div>
                  </div>

                  {/* Modelo 190 (Resumen Anual Retenciones del Trabajo) */}
                  <div className="bg-[#0e0c1d] border border-blue-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Modelo 190 (Resumen Anual Nóminas)</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                            🔒 1-31 Enero
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50">Relación individualizada de retenciones del trabajo del ejercicio</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-300">
                        {formatCurrency(borrador190.totalRetenciones)}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/70 leading-relaxed bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                      <strong>¿Por qué es un Resumen Anual?</strong> Consolida las retenciones de IRPF devengadas en las nóminas durante los cuatro trimestres (1T a 4T). Obligatorio para generar los certificados de retenciones de los empleados. Plazo oficial AEAT: 1 al 31 de enero.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModalModeloActivo('190')}
                        className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs rounded-xl font-medium transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>👁️ VER MODELO 190 OFICIAL</span>
                      </button>
                      <button
                        onClick={() => handlePresentarTelematicoAEAT('190')}
                        className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs rounded-xl font-medium transition-all"
                      >
                        Firmar (190)
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* TAB NUEVO: PÁGINA DE BALANCES & CUENTA DE RESULTADOS (PRO Y ENTERPRISE) */}
        {activeTab === 'balances' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit'] flex items-center gap-2">
                  <span>Balances Financieros & Cuenta de Resultados</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    PRO & ENTERPRISE
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-white/60 mt-0.5">
                  Consolidación contable en tiempo real: Facturación emitida, compras, costes de personal (TGSS), alquileres (19%), amortizaciones AEAT y EBITDA.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEnviarAGestoria('consolidado')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>📨 Exportar Balance a Gestoría</span>
                </button>
              </div>
            </div>

            {/* Cuadro Resumen Ejecutivo KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-white/50 block font-medium">Facturación Bruta (Ventas)</span>
                <div className="text-lg md:text-xl font-bold font-mono text-white">
                  {formatCurrency(balanceCalculado.ventasBrutas)}
                </div>
                <div className="text-[10px] text-white/40">Total con IVA: {formatCurrency(balanceCalculado.totalFacturadoClientes)}</div>
              </div>

              <div className="bg-[#0e0c1d] border border-emerald-500/20 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-emerald-400 block font-medium">Cobrado en Efectivo</span>
                <div className="text-lg md:text-xl font-bold font-mono text-emerald-400">
                  {formatCurrency(balanceCalculado.cobradoEfectivo)}
                </div>
                <div className="text-[10px] text-rose-400">Pendiente: {formatCurrency(balanceCalculado.pendienteCobroClientes)}</div>
              </div>

              <div className="bg-[#0e0c1d] border border-purple-500/20 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-purple-300 block font-medium">Coste Laboral Personal (TGSS)</span>
                <div className="text-lg md:text-xl font-bold font-mono text-purple-300">
                  {formatCurrency(balanceCalculado.costeLaboralTotal)}
                </div>
                <div className="text-[10px] text-white/40">Bruto: {formatCurrency(balanceCalculado.sueldosBrutosPersonal)} · SS Emp: {formatCurrency(balanceCalculado.seguridadSocialEmpresa)}</div>
              </div>

              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] text-[#f5c451] block font-medium">EBITDA (Margen Operativo)</span>
                <div className="text-lg md:text-xl font-bold font-mono text-[#f5c451]">
                  {formatCurrency(balanceCalculado.ebitda)}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  EBIT Neto: {formatCurrency(balanceCalculado.resultadoExplotacionEbit)}
                </div>
              </div>
            </div>

            {/* Desglose Analítico de Cuenta de Explotación */}
            <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
                Estructura de la Cuenta de Pérdidas y Ganancias (Octubre 2026)
              </h3>

              <div className="space-y-2 text-xs">
                {/* 1. Ingresos */}
                <div className="flex justify-between items-center py-1.5 text-white/90">
                  <span className="font-semibold text-white">(+) 1. Importe Neto de la Cifra de Negocios (Facturas Emitidas)</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(balanceCalculado.ventasBrutas)}</span>
                </div>

                {/* 2. Compras */}
                <div className="flex justify-between items-center py-1.5 text-white/70 pl-3">
                  <span>(-) 2. Aprovisionamientos y Compras a Proveedores (Facturas Recibidas)</span>
                  <span className="font-mono text-rose-300">-{formatCurrency(balanceCalculado.comprasYProveedores)}</span>
                </div>

                {/* 3. Personal */}
                <div className="flex justify-between items-center py-1.5 text-white/70 pl-3">
                  <span>(-) 3. Gastos de Personal (Sueldos y Cargas Sociales TGSS)</span>
                  <span className="font-mono text-rose-300">-{formatCurrency(balanceCalculado.costeLaboralTotal)}</span>
                </div>

                {/* 4. Alquileres */}
                <div className="flex justify-between items-center py-1.5 text-white/70 pl-3">
                  <span>(-) 4. Arrendamientos Comerciales (Nave y Taller - Retención 19%)</span>
                  <span className="font-mono text-rose-300">-{formatCurrency(balanceCalculado.alquileresComercialesBase)}</span>
                </div>

                {/* EBITDA */}
                <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/[0.03] font-bold text-white border border-white/5">
                  <span className="text-[#f5c451] uppercase tracking-wider text-[11px]">= RESULTADO BRUTO DE EXPLOTACIÓN (EBITDA)</span>
                  <span className="font-mono text-sm text-[#f5c451]">{formatCurrency(balanceCalculado.ebitda)}</span>
                </div>

                {/* 5. Amortizaciones */}
                <div className="flex justify-between items-center py-1.5 text-white/70 pl-3">
                  <span>(-) 5. Amortización del Inmovilizado Material (Tablas Oficiales AEAT)</span>
                  <span className="font-mono text-amber-300">-{formatCurrency(balanceCalculado.amortizacionPeriodoActivos)}</span>
                </div>

                {/* EBIT */}
                <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-emerald-500/10 font-bold text-white border border-emerald-500/30">
                  <span className="text-emerald-300 uppercase tracking-wider text-[11px]">= RESULTADO DE EXPLOTACIÓN (EBIT)</span>
                  <span className="font-mono text-base text-emerald-400">{formatCurrency(balanceCalculado.resultadoExplotacionEbit)}</span>
                </div>
              </div>
            </div>

            {/* Previsión de Tesorería e Impuestos en AEAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Previsión de Liquidaciones Tributarias (AEAT 4T)</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-white/70">
                    <span>Modelo 303 (IVA Neto a liquidar):</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(balanceCalculado.ivaNetoLiquidacion303)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Modelo 111 (Retenciones IRPF Nóminas):</span>
                    <span className="font-mono text-rose-300 font-bold">{formatCurrency(balanceCalculado.retencionesIrpfEmpleados)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Modelo 115 (Retenciones 19% Alquileres):</span>
                    <span className="font-mono text-rose-300 font-bold">{formatCurrency(balanceCalculado.retencionAlquiler19)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/5 font-bold text-white">
                    <span>Total Carga Fiscal a Ingresar en Sede:</span>
                    <span className="font-mono text-amber-400">{formatCurrency(balanceCalculado.totalImpuestosRetencionesAEAT)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Posición de Tesorería Disponible</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-white/70">
                    <span>Cobros de Clientes Realizados:</span>
                    <span className="font-mono text-emerald-400 font-bold">+{formatCurrency(balanceCalculado.cobradoEfectivo)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Pagos a Proveedores y Gastos:</span>
                    <span className="font-mono text-rose-300 font-bold">-{formatCurrency(balanceCalculado.totalGastosProveedores)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Salarios y Seguros Sociales Pagados:</span>
                    <span className="font-mono text-rose-300 font-bold">-{formatCurrency(balanceCalculado.costeLaboralTotal)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Alquileres Netos Pagados a Arrendador:</span>
                    <span className="font-mono text-rose-300 font-bold">-{formatCurrency(balanceCalculado.totalPagadoAlquileresNeto)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/5 font-bold text-white">
                    <span>Saldo Neto de Tesorería Operativa:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(balanceCalculado.saldoNetoTesoreriaEstimado)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB NUEVO: INTERCONEXIÓN DE LA RED EMPRESARIAL B2B (ENTERPRISE EXCLUSIVO) */}
        {activeTab === 'red_empresarial' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-['Outfit'] flex items-center gap-2">
                  <span>Red Empresarial B2B · Compartir Demanda de Bienes o Servicios</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    ENTERPRISE EXCLUSIVO
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-white/60 mt-0.5">
                  Ecosistema de interconexión directa entre empresas para compartir picos de demanda, subcontratación de talleres, compras conjuntas y logística.
                </p>
              </div>

              {activePlan === 'ENTERPRISE' && (
                <button
                  onClick={() => setIsModalNuevaDemandaOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>🤝 Publicar Demanda u Oferta</span>
                </button>
              )}
            </div>

            {/* Restricción si no es Enterprise */}
            {activePlan !== 'ENTERPRISE' ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
                <div className="text-3xl">🔒</div>
                <h3 className="text-base font-bold text-white">Interconexión B2B Reservada Exclusivamente para Plan ENTERPRISE</h3>
                <p className="text-xs text-amber-300 max-w-xl mx-auto leading-relaxed">
                  Junto a la conexión directa con la AEAT, la Red Empresarial para compartir demanda y oferta de bienes y servicios está restringida a los suscriptores Enterprise. Permite a su empresa captar trabajo de otros talleres y empresas de flotas, ahorrando comisiones de intermediación.
                </p>
                <button
                  onClick={() => {
                    setActivePlan('ENTERPRISE');
                    showNotice('Suscripción actualizada a GESTARIAN ENTERPRISE. Red B2B y Sede AEAT desbloqueadas.');
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:opacity-95 transition-opacity"
                >
                  Actualizar a Enterprise y Acceder a la Red B2B
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Filtros */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50">Mostrar:</span>
                  {(['TODAS', 'DEMANDA', 'OFERTA'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFiltroRed(f)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        filtroRed === f
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                      }`}
                    >
                      {f === 'TODAS' ? 'Todas las publicaciones' : f === 'DEMANDA' ? 'Demandas de Trabajo' : 'Ofertas de Capacidad / Stock'}
                    </button>
                  ))}
                </div>

                {/* Listado de Demandas y Ofertas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demandasRed
                    .filter(d => filtroRed === 'TODAS' || d.tipo === filtroRed)
                    .map(dem => (
                      <div key={dem.id} className="bg-[#0e0c1d] border border-white/8 rounded-2xl p-5 space-y-3 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                dem.tipo === 'DEMANDA'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {dem.tipo}
                              </span>
                              <span className="text-[10px] text-white/50 font-mono">{dem.id}</span>
                              <span className="text-[10px] bg-white/5 text-white/70 px-2 py-0.5 rounded">
                                {dem.categoria}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white">{dem.titulo}</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            dem.urgencia === 'ALTA' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/60'
                          }`}>
                            Urgencia {dem.urgencia}
                          </span>
                        </div>

                        <p className="text-white/70 text-[11px] leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                          {dem.descripcion}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60">
                          <div>Empresa: <strong className="text-white">{dem.empresaEmisora}</strong></div>
                          <div>Ubicación: <strong className="text-white">{dem.ubicacion}</strong></div>
                          <div>Presupuesto: <strong className="text-emerald-400 font-mono">{dem.presupuestoEstimado}</strong></div>
                          <div>Publicado: <span className="text-white/80">{dem.fechaPublicacion}</span></div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-[11px] text-white/40">Contacto: {dem.contacto}</span>
                          <button
                            onClick={() => showNotice(`🤝 Conexión enviada a ${dem.empresaEmisora} para la referencia ${dem.id}. Gestarian B2B ha enlazado vuestras sedes.`)}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow"
                          >
                            Conectar & Responder
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 9: CONFIGURACIÓN ÚNICA CON CANDADOS Y CONTROL DE VERSIONES (BIG TYPOGRAPHY UI) */}
        {activeTab === 'config' && (
          <div className="rounded-2xl overflow-hidden bg-white text-black shadow-2xl">
            <ConfiguracionPage
              currentPlan={activePlan}
              onChangePlan={(newPlan) => {
                setActivePlan(newPlan);
                showNotice(`Plan actualizado a: ${newPlan}`);
              }}
              onNotice={showNotice}
            />
          </div>
        )}
      </main>

      {/* Modal: Registrar Abono Parcial */}
      {selectedFactura && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121024] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Registrar Abono · {selectedFactura.factura_id}</h3>
              <button
                onClick={() => setSelectedFactura(null)}
                className="text-white/40 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <div className="text-xs text-white/70 space-y-1 bg-white/[0.03] p-3 rounded-xl border border-white/5">
              <div>Cliente: <strong className="text-white">{selectedFactura.cliente.razon_social}</strong></div>
              <div>Pendiente actual: <strong className="text-rose-400">{formatCurrency(selectedFactura.estado_gestion_cobros.importe_pendiente_abono)}</strong></div>
            </div>

            <form onSubmit={handleRegistrarAbono} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 block mb-1">Importe a abonar (EUR):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedFactura.estado_gestion_cobros.importe_pendiente_abono}
                  value={abonoImporte}
                  onChange={(e) => setAbonoImporte(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#a855f7]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFactura(null)}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white rounded-lg hover:opacity-95 transition-opacity"
                >
                  Confirmar y Enviar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Acceso Cliente con Email y DNI/CIF (Big Typography UI - Fricción Cero) */}
      {isClientLoginOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
          {/* Barra superior con selector rápido de demostración */}
          <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-medium uppercase tracking-wider text-[11px]">Acceso rápido demo:</span>
              <button
                type="button"
                onClick={() => handleClientLogin('cliente@gestarian.com', '12345678Z', 'PRO')}
                className="bg-white border border-neutral-300 hover:border-black text-black px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer"
              >
                DM Car (12345678Z)
              </button>
              <button
                type="button"
                onClick={() => handleClientLogin('facturacion@soluciones-tec.com', 'A87654321', 'PRO')}
                className="bg-white border border-neutral-300 hover:border-black text-black px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer"
              >
                Soluciones Tec (A87654321)
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsClientLoginOpen(false)}
              className="text-neutral-500 hover:text-black font-medium tracking-wider uppercase text-[11px] cursor-pointer"
            >
              ✕ Cerrar y Volver
            </button>
          </div>

          {loginError && (
            <div className="max-w-md mx-auto mt-4 px-6">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                {loginError}
              </div>
            </div>
          )}

          <ClientLogin
            onSuccess={(email, dni) => {
              handleClientLogin(email, dni);
            }}
            onCancel={() => setIsClientLoginOpen(false)}
          />
        </div>
      )}

      {/* MODAL 1: VISOR OFICIAL DE MODELOS AEAT (303, 111, 115, 180, 190) */}
      {modalModeloActivo && (
        <ModalVerModeloOficial
          tipo={modalModeloActivo}
          borrador303={borrador303}
          borrador111={borrador111}
          borrador115={borrador115}
          borrador180={borrador180}
          borrador190={borrador190}
          onClose={() => setModalModeloActivo(null)}
        />
      )}

      {/* MODAL 2: VISOR OFICIAL DE NÓMINA INDIVIDUAL (DOCUMENTO OFICIAL DE LA EMPRESA) */}
      {modalNominaActiva && (
        <ModalVerNomina
          nomina={modalNominaActiva}
          onClose={() => setModalNominaActiva(null)}
        />
      )}

      {/* MODAL 3: DAR DE ALTA EMPLEADO AUTORIZADO (ENVÍO EMAIL Y WHATSAPP) */}
      {isModalAltaEmpleadoOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#100f20] border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-white my-auto">
            <div className="flex justify-between items-start pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold font-['Outfit']">Dar de Alta Empleado Autorizado</h3>
                <p className="text-xs text-white/60">
                  Al crearlo, el sistema transmitirá automáticamente el enlace oficial de descarga e instalación de la app por Email y WhatsApp.
                </p>
              </div>
              <button
                onClick={() => setIsModalAltaEmpleadoOpen(false)}
                className="text-white/40 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDarAltaEmpleado} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Marcos"
                    value={formAltaEmpleado.nombre}
                    onChange={(e) => setFormAltaEmpleado(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Serrano Ruiz"
                    value={formAltaEmpleado.apellidos}
                    onChange={(e) => setFormAltaEmpleado(prev => ({ ...prev, apellidos: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Email Corporativo / Personal *</label>
                  <input
                    type="email"
                    required
                    placeholder="empleado@dmcar.es"
                    value={formAltaEmpleado.email}
                    onChange={(e) => setFormAltaEmpleado(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Teléfono Móvil (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+34 612 345 678"
                    value={formAltaEmpleado.telefono}
                    onChange={(e) => setFormAltaEmpleado(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Rol de Acceso y Permisos</label>
                  <select
                    value={formAltaEmpleado.rol}
                    onChange={(e: any) => setFormAltaEmpleado(prev => ({ ...prev, rol: e.target.value }))}
                    className="w-full bg-[#18162e] border border-white/15 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="MECANICO_OPERARIO">Mecánico / Operario (Fichar + Ver Nóminas €)</option>
                    <option value="ADMINISTRATIVO">Administrativo (Facturación + Nóminas)</option>
                    <option value="JEFE_TALLER">Jefe de Taller (Acceso Integral)</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Grupo de Cotización SS (2026)</label>
                  <select
                    value={formAltaEmpleado.grupoCotizacion}
                    onChange={(e) => setFormAltaEmpleado(prev => ({ ...prev, grupoCotizacion: parseInt(e.target.value) || 8 }))}
                    className="w-full bg-[#18162e] border border-white/15 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value={1}>Grupo 1: Ingenieros y Licenciados</option>
                    <option value={2}>Grupo 2: Ingenieros Técnicos / Peritos</option>
                    <option value={3}>Grupo 3: Jefes de Taller / Admin</option>
                    <option value={5}>Grupo 5: Oficiales Administrativos</option>
                    <option value={7}>Grupo 7: Auxiliares Administrativos</option>
                    <option value={8}>Grupo 8: Oficiales de 1ª y 2ª (Mecánicos)</option>
                    <option value={9}>Grupo 9: Oficiales de 3ª y Especialistas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Salario Base Mensual (€)</label>
                <input
                  type="number"
                  step="50"
                  min="1400"
                  value={formAltaEmpleado.salarioBase}
                  onChange={(e) => setFormAltaEmpleado(prev => ({ ...prev, salarioBase: parseFloat(e.target.value) || 1800 }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1 text-[11px]">
                <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <span>📲 Notificaciones Inmediatas:</span>
                </div>
                <p className="text-white/70">
                  El trabajador recibirá un SMS/WhatsApp con el enlace de instalación para Android/iOS y un correo de bienvenida con sus credenciales autorizadas. Podrá fichar en el control horario e inspeccionar sus recibos de salario desde el icono del euro (€).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalAltaEmpleadoOpen(false)}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white rounded-xl hover:opacity-95 transition-opacity flex items-center gap-2"
                >
                  <span>✓ Dar de Alta y Transmitir Enlace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PUBLICAR EN RED EMPRESARIAL B2B (ENTERPRISE) */}
      {isModalNuevaDemandaOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121024] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-white my-auto">
            <div className="flex justify-between items-start pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] text-amber-300">Publicar en la Red Empresarial B2B</h3>
                <p className="text-xs text-white/60">
                  Comparta demanda de servicios o exceso de capacidad productiva con la red de empresas verificadas Gestarian.
                </p>
              </div>
              <button
                onClick={() => setIsModalNuevaDemandaOpen(false)}
                className="text-white/40 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePublicarDemandaRed} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormNuevaDemanda(prev => ({ ...prev, tipo: 'DEMANDA' }))}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    formNuevaDemanda.tipo === 'DEMANDA'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  DEMANDA (Necesito Servicios / Bienes)
                </button>
                <button
                  type="button"
                  onClick={() => setFormNuevaDemanda(prev => ({ ...prev, tipo: 'OFERTA' }))}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    formNuevaDemanda.tipo === 'OFERTA'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  OFERTA (Tengo Capacidad / Stock)
                </button>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Título de la Publicación *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Subcontratación Chapa y Pintura para 10 furgonetas"
                  value={formNuevaDemanda.titulo}
                  onChange={(e) => setFormNuevaDemanda(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Categoría</label>
                  <select
                    value={formNuevaDemanda.categoria}
                    onChange={(e: any) => setFormNuevaDemanda(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full bg-[#18162e] border border-white/15 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="MECANICA_VEHICULOS">Mecánica & Vehículos</option>
                    <option value="RECAMBIOS_SUMINISTROS">Recambios & Suministros</option>
                    <option value="LOGISTICA_TRANSPORTE">Logística & Grúa</option>
                    <option value="PERITAJE_HOMOLOGACION">Peritaje & Homologación</option>
                    <option value="SERVICIOS_PROFESIONALES">Servicios Profesionales</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Urgencia</label>
                  <select
                    value={formNuevaDemanda.urgencia}
                    onChange={(e: any) => setFormNuevaDemanda(prev => ({ ...prev, urgencia: e.target.value }))}
                    className="w-full bg-[#18162e] border border-white/15 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="ALTA">Alta (Menos de 48h)</option>
                    <option value="MEDIA">Media (Esta semana)</option>
                    <option value="ESTANDAR">Estándar (Planificado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Descripción y Requisitos Técnicos *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalles del volumen, plazos, homologaciones necesarias..."
                  value={formNuevaDemanda.descripcion}
                  onChange={(e) => setFormNuevaDemanda(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">Presupuesto Estimado (€)</label>
                  <input
                    type="text"
                    placeholder="ej. 8.500 € / mes"
                    value={formNuevaDemanda.presupuestoEstimado}
                    onChange={(e) => setFormNuevaDemanda(prev => ({ ...prev, presupuestoEstimado: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Email / Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="operaciones@dmcar-taller.es"
                    value={formNuevaDemanda.contacto}
                    onChange={(e) => setFormNuevaDemanda(prev => ({ ...prev, contacto: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalNuevaDemandaOpen(false)}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl hover:opacity-95 transition-opacity"
                >
                  Publicar en la Red B2B
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: VISOR DOCUMENTAL MINIMALISTA (ESTILO GESTARIAN QUICK) */}
      {documentoMinimalistaActivo && (
        <ModalDocumentoMinimalista
          documento={documentoMinimalistaActivo}
          onClose={() => setDocumentoMinimalistaActivo(null)}
          onNotice={showNotice}
        />
      )}
    </div>
  );
}
