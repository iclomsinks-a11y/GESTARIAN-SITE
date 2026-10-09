/**
 * Módulo de Activos (Inmovilizado) e Inmuebles Arrendados
 * Normativa: Tablas Oficiales de Amortización AEAT (Ley 27/2014) y Retención 19% Alquileres (Modelo 115/180)
 */

export interface ActivoPropiedad {
  id: string;
  codigoInterno: string;
  nombre: string;
  categoria: 'MAQUINARIA' | 'VEHICULO' | 'EQUIPO_INFORMATICO' | 'INSTALACION' | 'INMUEBLE';
  fechaAdquisicion: string;
  valorAdquisicion: number;
  coeficienteAmortizacionAnual: number; // Porcentaje anual según AEAT (ej: 12% maquinaria)
  periodoMaximoAnos: number;
  amortizacionAcumulada: number;
  cuotaAnual: number;
  valorNetoContable: number;
}

export interface InmuebleArrendado {
  id: string;
  nombreLocal: string; // ej. "Nave Principal Taller Mecánico DM Car"
  direccionCompleta: string;
  referenciaCatastral: string; // Obligatorio para Modelo 180 (ej. 9872023VH5797S0001WX)
  arrendador: {
    razonSocial: string;
    nifCif: string;
    email: string;
  };
  baseImponibleMensual: number; // EUR
  porcentajeRetencionIrpf: 19.0; // 19% legal obligatorio
  porcentajeIva: 21.0;
  retencionMensual: number; // Base * 0.19
  cuotaIvaMensual: number; // Base * 0.21
  totalFacturaPagarMensual: number; // Base + IVA - Retención
  fechaContratoInicio: string;
  fechaProximaRevisionRentaIpc: string; // Para alertas Metis
}

export interface BorradorModelo115 {
  ejercicio: number;
  periodo: '1T' | '2T' | '3T' | '4T';
  casilla_01_numero_perceptores: number;
  casilla_02_base_retenciones: number;
  casilla_03_importe_retenciones: number; // 19%
  casilla_05_total_ingresar: number;
}

export interface BorradorModelo180 {
  ejercicio: number;
  totalArrendadores: number;
  totalBases: number;
  totalRetenciones: number;
  inmueblesRegistrados: Array<{
    nifArrendador: string;
    nombreArrendador: string;
    referenciaCatastral: string;
    direccion: string;
    baseImponibleAnual: number;
    retencion19Anual: number;
  }>;
}
