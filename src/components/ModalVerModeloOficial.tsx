import React from 'react';
import { formatCurrency } from '../modules/fiscal/engine';
import { Modelo303Borrador } from '../modules/fiscal/types';
import { BorradorModelo111, BorradorModelo190 } from '../modules/laboral/types';
import { BorradorModelo115, BorradorModelo180 } from '../modules/activos/types';

export type TipoModeloAEAT = '303' | '111' | '115' | '180' | '190';

interface ModalVerModeloOficialProps {
  tipo: TipoModeloAEAT;
  borrador303?: Modelo303Borrador;
  borrador111?: BorradorModelo111;
  borrador115?: BorradorModelo115;
  borrador180?: BorradorModelo180;
  borrador190?: BorradorModelo190;
  onClose: () => void;
}

export const ModalVerModeloOficial: React.FC<ModalVerModeloOficialProps> = ({
  tipo,
  borrador303,
  borrador111,
  borrador115,
  borrador180,
  borrador190,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#0c0d18] border border-[#6366f1]/40 rounded-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in text-white my-auto">
        {/* Cabecera Oficial AEAT */}
        <div className="flex justify-between items-start pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AGENCIA TRIBUTARIA · SEDE ELECTRÓNICA
              </span>
              <span className="text-xs text-white/50 font-mono">Ejercicio Fiscal 2026</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-['Outfit'] mt-1 text-white">
              {tipo === '303' && 'Modelo 303 · Impuesto sobre el Valor Añadido (IVA)'}
              {tipo === '111' && 'Modelo 111 · Retenciones del Trabajo y Actividades Económicas'}
              {tipo === '115' && 'Modelo 115 · Retenciones por Arrendamiento de Inmuebles Urbanos'}
              {tipo === '180' && 'Modelo 180 · Resumen Anual de Arrendamientos Urbanos'}
              {tipo === '190' && 'Modelo 190 · Resumen Anual de Retenciones del Trabajo (IRPF)'}
            </h2>
            <p className="text-xs text-white/60">
              {tipo === '303' && 'Declaración-Liquidación trimestral oficial conforme al Real Decreto 1619/2012.'}
              {tipo === '111' && 'Retenciones e ingresos a cuenta sobre rendimientos del trabajo del período.'}
              {tipo === '115' && 'Retenciones del 19% practicadas sobre alquileres de locales y naves comerciales.'}
              {tipo === '180' && 'Declaración informativa anual con desglose por arrendador y Referencia Catastral.'}
              {tipo === '190' && 'Declaración informativa anual con la relación individualizada de perceptores.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-2xl transition-colors p-1"
            aria-label="Cerrar modelo"
          >
            &times;
          </button>
        </div>

        {/* Identificación del Declarante */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/[0.02] p-3.5 rounded-xl border border-white/5 text-xs">
          <div>
            <span className="text-white/50 block">Declarante (Empresa):</span>
            <strong className="text-white">DM CAR TALLER MECÁNICO S.L.</strong>
          </div>
          <div>
            <span className="text-white/50 block">NIF / CIF:</span>
            <strong className="text-white font-mono">B12345678</strong>
          </div>
          <div>
            <span className="text-white/50 block">Período / Devengo:</span>
            <strong className="text-white">
              {tipo === '180' || tipo === '190' ? 'ANUAL (Ene-Dic 2026)' : '4T (Trimestre 4 - 2026)'}
            </strong>
          </div>
        </div>

        {/* ───────────────── MODELO 303 (IVA) ───────────────── */}
        {tipo === '303' && borrador303 && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="font-bold text-[#c4b5fd] text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                I. IVA Devengado (Operaciones Interiores / Ventas)
              </div>
              <div className="flex justify-between text-white/70">
                <span>[01] Base imponible gravada al 21%</span>
                <span className="font-mono text-white">{formatCurrency(borrador303.casilla_01_base_21)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>[03] Cuota devengada al 21%</span>
                <span className="font-mono text-white">{formatCurrency(borrador303.casilla_03_cuota_21)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-white/5">
                <span>[07] Total cuota devengada</span>
                <span className="font-mono text-emerald-400">{formatCurrency(borrador303.casilla_07_total_devengado)}</span>
              </div>
            </div>

            <div className="space-y-2 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="font-bold text-amber-300 text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                II. IVA Deducible (Facturas Recibidas / Gastos)
              </div>
              <div className="flex justify-between text-white/70">
                <span>[28] Base por cuotas soportadas en operaciones interiores</span>
                <span className="font-mono text-white">{formatCurrency(borrador303.casilla_28_base_deducible)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>[29] Cuotas soportadas deducibles</span>
                <span className="font-mono text-white">{formatCurrency(borrador303.casilla_29_cuota_deducible)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-white/5">
                <span>[45] Total a deducir</span>
                <span className="font-mono text-amber-300">{formatCurrency(borrador303.casilla_45_total_deducible)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/40 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-bold text-purple-300 block">[71] RESULTADO DE LA LIQUIDACIÓN</span>
                <span className="text-[11px] text-white/50">Diferencia entre IVA devengado e IVA soportado deducible</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {formatCurrency(borrador303.casilla_71_resultado_declaracion)}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────── MODELO 111 (NÓMINAS) ───────────────── */}
        {tipo === '111' && borrador111 && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="font-bold text-[#c4b5fd] text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                I. Rendimientos del Trabajo (Nóminas de Empleados)
              </div>
              <div className="flex justify-between text-white/70">
                <span>[01] Número de perceptores en el trimestre</span>
                <span className="font-mono text-white font-bold">{borrador111.casilla_01_numero_perceptores} empleados</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>[02] Importe total de las percepciones dinerarias íntegras</span>
                <span className="font-mono text-white font-bold">{formatCurrency(borrador111.casilla_02_importe_percepciones)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>[03] Importe de las retenciones practicadas</span>
                <span className="font-mono text-rose-300 font-bold">{formatCurrency(borrador111.casilla_03_importe_retenciones)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-300 block">[28] TOTAL A INGRESAR EN SEDE AEAT</span>
                <span className="text-[11px] text-white/50">Retenciones a cuenta de IRPF devengadas en nóminas del período</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(borrador111.casilla_28_total_liquidar)}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────── MODELO 115 (ALQUILERES) ───────────────── */}
        {tipo === '115' && borrador115 && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="font-bold text-[#c4b5fd] text-xs uppercase tracking-wider border-b border-white/5 pb-1">
                Liquidación de Retenciones sobre Arrendamientos Urbanos
              </div>
              <div className="flex justify-between text-white/70">
                <span>[01] Número de perceptores (arrendadores)</span>
                <span className="font-mono text-white font-bold">{borrador115.casilla_01_numero_perceptores}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>[02] Base total de las retenciones (bases imponibles de alquileres)</span>
                <span className="font-mono text-white font-bold">{formatCurrency(borrador115.casilla_02_base_retenciones)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>[03] Retenciones practicadas (tipo oficial 19,00%)</span>
                <span className="font-mono text-rose-300 font-bold">{formatCurrency(borrador115.casilla_03_importe_retenciones)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-bold text-amber-300 block">[05] TOTAL A INGRESAR EN SEDE AEAT</span>
                <span className="text-[11px] text-white/50">Retención fiscal del 19% ingresada a la Administración tributaria</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {formatCurrency(borrador115.casilla_05_total_ingresar)}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────── MODELO 180 (RESUMEN ANUAL ALQUILERES) ───────────────── */}
        {tipo === '180' && (
          <div className="space-y-4 text-xs">
            {/* Explicación oficial exigida por el usuario */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                <span>📌 ¿Por qué el Modelo 180 es un Resumen Anual?</span>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed">
                El <strong>Modelo 180</strong> no sustituye al Modelo 115 trimestral, sino que es una <strong>Declaración Informativa de Resumen Anual</strong>. Por imperativo del calendario de la AEAT, <strong>se presenta una vez al año (entre el 1 y el 31 de enero del ejercicio posterior)</strong>, una vez que han finalizado y se han liquidado los cuatro trimestres (1T, 2T, 3T y 4T). Su propósito legal es relacionar de forma nominativa a los arrendadores e incluir de manera obligatoria la <strong>Referencia Catastral</strong> y situación de los inmuebles arrendados.
              </p>
            </div>

            {borrador180 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Arrendadores registrados: <strong>{borrador180.totalArrendadores}</strong></span>
                  <span className="text-white/60">Base anual acumulada: <strong className="text-white font-mono">{formatCurrency(borrador180.totalBases)}</strong></span>
                  <span className="text-white/60">Retención 19% anual: <strong className="text-rose-400 font-mono">{formatCurrency(borrador180.totalRetenciones)}</strong></span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                  <div className="font-bold text-white text-xs border-b border-white/5 pb-1">
                    Relación de Inmuebles Afectos y Datos Catastrales:
                  </div>
                  {borrador180.inmueblesRegistrados.map((inm, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between font-semibold text-white">
                        <span>{inm.nombreArrendador} ({inm.nifArrendador})</span>
                        <span className="font-mono text-purple-300 font-bold">Catastro: {inm.referenciaCatastral}</span>
                      </div>
                      <div className="text-white/50">{inm.direccion}</div>
                      <div className="flex justify-between pt-1 border-t border-white/5 text-[11px]">
                        <span>Base Anual: <strong className="text-white">{formatCurrency(inm.baseImponibleAnual)}</strong></span>
                        <span>Retención 19%: <strong className="text-rose-400 font-bold">{formatCurrency(inm.retencion19Anual)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───────────────── MODELO 190 (RESUMEN ANUAL TRABAJO) ───────────────── */}
        {tipo === '190' && (
          <div className="space-y-4 text-xs">
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-300 text-xs">
                <span>📌 Resumen Anual de Retenciones del Trabajo (Modelo 190)</span>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed">
                El <strong>Modelo 190</strong> recopila la totalidad de las retenciones a cuenta del IRPF practicadas a los empleados durante los cuatro trimestres del año. Plazo de presentación oficial AEAT: <strong>del 1 al 31 de enero</strong> del ejercicio siguiente.
              </p>
            </div>

            {borrador190 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                <div className="font-bold text-white text-xs border-b border-white/5 pb-1">
                  Relación Individualizada de Perceptores:
                </div>
                {borrador190.registrosPerceptores.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-white/[0.02] rounded-lg text-xs">
                    <div>
                      <span className="font-semibold text-white">{p.nombre}</span>
                      <span className="text-white/40 block font-mono text-[11px]">NIF: {p.nif}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white/60 block">Percepción: {formatCurrency(p.percepcionIntegra)}</span>
                      <span className="font-mono text-rose-300 font-bold">Retención IRPF: {formatCurrency(p.retencionPracticada)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pie con opciones */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
          <div className="text-white/40 text-[11px]">
            Código Seguro de Verificación (CSV): CSV-AEAT-2026-X88942-OK · Válido para cotejo en Sede Electrónica
          </div>
          <button
            onClick={() => window.print()}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg border border-white/15 transition-all flex items-center gap-2"
          >
            <span>🖨️ Imprimir / Guardar Modelo Oficial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
