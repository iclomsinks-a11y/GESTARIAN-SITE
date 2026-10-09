/**
 * GESTARIAN Official Document Numbering Standards
 * Homologado según la arquitectura de los repositorios originales (PRO, QUICK, LITE)
 * y normativa española (RD 1619/2012 / Veri*Factu / AEAT).
 *
 * 1. Solicitud de Presupuesto (Cliente): S260000 (S + Año 2 dígitos + Secuencia 4 dígitos)
 * 2. Presupuesto (Taller): P260000 (P + Año 2 dígitos + Secuencia 4 dígitos, sin trimestre)
 * 3. Expediente de Taller: E + numeración del presupuesto relacionado (ej. EP260000 o E260000)
 * 4. Factura Ordinaria Oficial: FAAXXXX (ej. F260001, F260489)
 * 5. Factura Rectificativa: FR + correlativo 1 dígito + número factura referencia (ej. FR1260001)
 * 6. Factura Proforma: FPAAXXXX (ej. FP260001)
 * 7. Factura Recibida / Registro Interno de Gastos: FR[Trimestre]TAAXXXX (ej. FR4T260001)
 * 8. Recibo de Abono: REC-[EXP/FAC]-XX (ej. REC-F260489-01, REC-2026-0489-01)
 */

export interface FormatoSecuenciaInfo {
  prefijo: string;
  año: number;
  trimestre?: number;
  secuencia: number;
  numeroCompleto: string;
}

/**
 * Devuelve el sufijo de 2 dígitos del año actual o dado (ej. 2026 -> '26').
 */
export function getYearSuffix(customDate?: Date | string): string {
  const d = customDate ? new Date(customDate) : new Date();
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  return year.toString().slice(-2);
}

/**
 * Devuelve el trimestre fiscal (1, 2, 3 o 4) de una fecha.
 */
export function getFiscalQuarter(customDate?: Date | string): number {
  const d = customDate ? new Date(customDate) : new Date();
  const month = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
  return Math.floor(month / 3) + 1;
}

/**
 * 1. SOLICITUD DE PRESUPUESTO: S260000 (S + Año 2 dígitos + 4 dígitos)
 * Ejemplo: S260000, S260001
 */
export function generarNumeroSolicitudPresupuesto(
  secuencia: number = 0,
  fecha?: Date | string
): string {
  const yy = getYearSuffix(fecha);
  const seqStr = String(Math.max(0, secuencia)).padStart(4, '0');
  return `S${yy}${seqStr}`;
}

/**
 * 2. PRESUPUESTO OFICIAL DE TALLER: P260000 (P + Año 2 dígitos + 4 dígitos, sin trimestre)
 * Ejemplo: P260000, P260001, P260082
 */
export function generarNumeroPresupuesto(
  secuencia: number = 0,
  fecha?: Date | string
): string {
  const yy = getYearSuffix(fecha);
  const seqStr = String(Math.max(0, secuencia)).padStart(4, '0');
  return `P${yy}${seqStr}`;
}

/**
 * 3. EXPEDIENTE DE TALLER: E + numeración del presupuesto relacionado
 * Si se pasa el presupuesto de referencia (ej. P260000 o 260000), genera EP260000 (o E260000).
 * Ejemplo: EP260000, EP260082, E260000
 */
export function generarNumeroExpediente(
  presupuestoRef?: string,
  secuencia: number = 0,
  customYear?: number
): string {
  if (presupuestoRef && presupuestoRef.trim()) {
    const clean = presupuestoRef.trim().replace(/^#/, '');
    if (clean.startsWith('E')) {
      return clean;
    }
    return `E${clean}`;
  }
  const yy = customYear ? customYear.toString().slice(-2) : getYearSuffix();
  const seqStr = String(Math.max(0, secuencia)).padStart(4, '0');
  return `EP${yy}${seqStr}`;
}

/**
 * 4. FACTURA ORDINARIA: FAAXXXX (ej. F260001, F260489)
 */
export function generarNumeroFacturaOrdinaria(
  secuencia: number = 1,
  customYear?: number
): string {
  const yy = customYear ? customYear.toString().slice(-2) : getYearSuffix();
  const seqStr = String(Math.max(1, secuencia)).padStart(4, '0');
  return `F${yy}${seqStr}`;
}

/**
 * 5. FACTURA RECTIFICATIVA:
 * FR + número correlativo de factura rectificativa de un solo dígito + número de la factura de referencia
 * Ejemplo oficial del usuario: Factura ref 260001 / F260001 -> FR1260001
 * Segunda rectificación -> FR2260001
 */
export function generarNumeroFacturaRectificativa(
  facturaReferencia: string | number = '260001',
  correlativoDigito: number = 1
): string {
  const digito = Math.max(1, Math.min(9, correlativoDigito));
  // Extraer el número de la factura de referencia (quitando 'F' o '#' si está presente)
  const refStr = String(facturaReferencia).trim().replace(/^[#Ff]/, '');
  const cleanRef = refStr || '260001';
  return `FR${digito}${cleanRef}`;
}

/**
 * 6. FACTURA PROFORMA: FPAAXXXX (ej. FP260001)
 * Documento informativo para empresas y aseguradoras previo al devengo.
 */
export function generarNumeroFacturaProforma(
  secuencia: number = 1,
  customYear?: number
): string {
  const yy = customYear ? customYear.toString().slice(-2) : getYearSuffix();
  const seqStr = String(Math.max(1, secuencia)).padStart(4, '0');
  return `FP${yy}${seqStr}`;
}

/**
 * 7. FACTURA RECIBIDA / REGISTRO INTERNO DE GASTOS:
 * Formato correlativo tributario: FR[Trimestre]TAAXXXX (ej. FR4T260001)
 */
export function generarNumeroRegistroFacturaRecibida(
  secuencia: number = 1,
  fecha?: Date | string
): string {
  const q = getFiscalQuarter(fecha);
  const yy = getYearSuffix(fecha);
  const seqStr = String(Math.max(1, secuencia)).padStart(4, '0');
  return `FR${q}T${yy}${seqStr}`;
}

/**
 * 8. RECIBO DE ABONO PARCIAL O A CUENTA:
 * Genera el ID correlativo del recibo vinculado a la factura o expediente.
 * Ejemplo: REC-F260489-01, REC-2026-0489-01
 */
export function generarNumeroRecibo(
  documentoRef: string,
  indicePago: number = 1
): string {
  const cleanRef = (documentoRef || 'DOC').replace(/[^a-zA-Z0-9-]/g, '');
  const seqStr = String(Math.max(1, indicePago)).padStart(2, '0');
  return `REC-${cleanRef}-${seqStr}`;
}

/**
 * Parser y comprobador de tipo de documento a partir de su identificador.
 */
export function identificarTipoDocumento(num: string): {
  tipo: 'SOLICITUD' | 'PRESUPUESTO' | 'FACTURA_ORDINARIA' | 'FACTURA_RECTIFICATIVA' | 'FACTURA_PROFORMA' | 'FACTURA_RECIBIDA' | 'EXPEDIENTE' | 'RECIBO' | 'DESCONOCIDO';
  esValido: boolean;
  año?: number;
  trimestre?: number;
  secuencia?: number;
  facturaReferencia?: string;
  rectificativaDigito?: number;
} {
  if (!num) return { tipo: 'DESCONOCIDO', esValido: false };
  const str = num.trim().toUpperCase();

  // Solicitud: S260000 o SOL-2026-001
  const mSolS = str.match(/^S(\d{2})(\d{4})$/);
  if (mSolS) {
    return {
      tipo: 'SOLICITUD',
      esValido: true,
      año: 2000 + parseInt(mSolS[1], 10),
      secuencia: parseInt(mSolS[2], 10),
    };
  }
  const mSolLegacy = str.match(/^SOL-(\d{4})-(\d{3,4})$/);
  if (mSolLegacy) {
    return {
      tipo: 'SOLICITUD',
      esValido: true,
      año: parseInt(mSolLegacy[1], 10),
      secuencia: parseInt(mSolLegacy[2], 10),
    };
  }

  // Presupuesto sin trimestre: P260000, P260082
  const mPresP = str.match(/^P(\d{2})(\d{4})$/);
  if (mPresP) {
    return {
      tipo: 'PRESUPUESTO',
      esValido: true,
      año: 2000 + parseInt(mPresP[1], 10),
      secuencia: parseInt(mPresP[2], 10),
    };
  }

  // Presupuesto con trimestre (soporte retrocompatible): P3T260001
  const mPresT = str.match(/^P([1-4])T(\d{2})(\d{4})$/);
  if (mPresT) {
    return {
      tipo: 'PRESUPUESTO',
      esValido: true,
      trimestre: parseInt(mPresT[1], 10),
      año: 2000 + parseInt(mPresT[2], 10),
      secuencia: parseInt(mPresT[3], 10),
    };
  }

  // Presupuesto clásico: PRES-26001 o PRES-0001 o PRE-2026-419
  const mPresClassic = str.match(/^(?:PRES|PRE)-(?:(\d{4})|(\d{2}))-?(\d{3,4})$/);
  if (mPresClassic) {
    return {
      tipo: 'PRESUPUESTO',
      esValido: true,
      secuencia: parseInt(mPresClassic[3], 10),
    };
  }

  // Factura Rectificativa: FR1260001 (FR + 1 dígito + referencia de factura)
  const mRectNuevo = str.match(/^FR([1-9])(\d{4,})$/);
  if (mRectNuevo) {
    return {
      tipo: 'FACTURA_RECTIFICATIVA',
      esValido: true,
      rectificativaDigito: parseInt(mRectNuevo[1], 10),
      facturaReferencia: mRectNuevo[2],
    };
  }

  // Factura Rectificativa formato previo: FR260001
  const mRect = str.match(/^FR(\d{2})(\d{4,})$/);
  if (mRect) {
    return {
      tipo: 'FACTURA_RECTIFICATIVA',
      esValido: true,
      año: 2000 + parseInt(mRect[1], 10),
      secuencia: parseInt(mRect[2], 10),
    };
  }

  // Factura Proforma: FP260001
  const mProf = str.match(/^FP(\d{2})(\d{4,})$/);
  if (mProf) {
    return {
      tipo: 'FACTURA_PROFORMA',
      esValido: true,
      año: 2000 + parseInt(mProf[1], 10),
      secuencia: parseInt(mProf[2], 10),
    };
  }

  // Factura Recibida correlativo con trimestre: FR1T260001
  const mRecib = str.match(/^FR([1-4])T(\d{2})(\d{4})$/);
  if (mRecib) {
    return {
      tipo: 'FACTURA_RECIBIDA',
      esValido: true,
      trimestre: parseInt(mRecib[1], 10),
      año: 2000 + parseInt(mRecib[2], 10),
      secuencia: parseInt(mRecib[3], 10),
    };
  }

  // Factura Ordinaria: F260001 o FACT-2026-0489
  const mFactF = str.match(/^F(\d{2})(\d{4,})$/);
  if (mFactF) {
    return {
      tipo: 'FACTURA_ORDINARIA',
      esValido: true,
      año: 2000 + parseInt(mFactF[1], 10),
      secuencia: parseInt(mFactF[2], 10),
    };
  }

  // Expediente: EP260000, E260000, EXP-26001
  if (str.startsWith('EP') || str.startsWith('EXP-') || (str.startsWith('E') && /^[E]\d+/.test(str))) {
    return { tipo: 'EXPEDIENTE', esValido: true };
  }

  // Recibo: REC-...
  if (str.startsWith('REC-')) {
    return { tipo: 'RECIBO', esValido: true };
  }

  return { tipo: 'DESCONOCIDO', esValido: false };
}
