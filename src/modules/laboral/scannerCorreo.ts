/**
 * Módulo de Escáner de Correo Entrante para Nóminas (Gestoría Externa)
 * Permite la recepción y lectura automática de PDFs de nómina emitidos por la asesoría/gestoría.
 */

export interface CorreoNominaDetectado {
  id: string;
  remitente: string; // ej. gestoria.fiscal@asesoresasociados.es
  asunto: string; // ej. "Nóminas Octubre 2026 - DM Car Taller Mecánico"
  fechaRecepcion: string;
  nombreFicheroPdf: string;
  tamanoFichero: string;
  mesPeriodo: string; // "2026-10"
  empleadosDetectados: Array<{
    nif: string;
    nombre: string;
    bruto: number;
    irpfRetenido: number;
    liquidoNeto: number;
    ssTrabajador: number;
    ssEmpresa: number;
  }>;
  estadoProcesado: 'PENDIENTE' | 'SINCRONIZADO';
}

export const CORREOS_NOMINAS_MOCK: CorreoNominaDetectado[] = [
  {
    id: 'MAIL-NOM-2026-10-01',
    remitente: 'laboral@gestoriaramos-asesores.com',
    asunto: 'Remesa Nóminas Mensualidad Octubre 2026 - Taller DM Car SL',
    fechaRecepcion: '2026-10-05 11:34',
    nombreFicheroPdf: 'Nominas_DM_Car_Octubre_2026_Selladas.pdf',
    tamanoFichero: '1.4 MB',
    mesPeriodo: '2026-10',
    empleadosDetectados: [
      {
        nif: '48920112A',
        nombre: 'Carlos Mendoza Díaz',
        bruto: 2916.67,
        irpfRetenido: 437.50,
        liquidoNeto: 2289.47,
        ssTrabajador: 189.70,
        ssEmpresa: 871.20
      },
      {
        nif: '52309144B',
        nombre: 'Laura Ramos Vega',
        bruto: 2100.00,
        irpfRetenido: 252.00,
        liquidoNeto: 1711.50,
        ssTrabajador: 136.50,
        ssEmpresa: 627.90
      },
      {
        nif: '76110928C',
        nombre: 'Alejandro Gil Soto',
        bruto: 2333.33,
        irpfRetenido: 315.00,
        liquidoNeto: 1866.66,
        ssTrabajador: 151.67,
        ssEmpresa: 704.67
      }
    ],
    estadoProcesado: 'SINCRONIZADO'
  }
];

export interface DatosPreprogramadosEnvioGestoria {
  mes: string;
  incluirHorasFichajeAutomatico: boolean;
  horasExtrasTotales: number;
  dietasTotales: number;
  bajasItIncidencias: string;
  observaciones: string;
}
