import React from 'react';
import { NominaCalculada } from '../modules/laboral/types';
import { formatCurrency, formatDateES } from '../modules/fiscal/engine';
import { GRUPOS_COTIZACION_2026 } from '../modules/laboral/engine';

interface ModalVerNominaProps {
  nomina: NominaCalculada;
  onClose: () => void;
}

export const ModalVerNomina: React.FC<ModalVerNominaProps> = ({ nomina, onClose }) => {
  const grupoInfo = GRUPOS_COTIZACION_2026[nomina.grupoCotizacion];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#0b0c16] border border-white/20 rounded-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in text-white my-auto">
        {/* Cabecera del Documento Oficial */}
        <div className="flex justify-between items-start pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DOCUMENTO OFICIAL DE NÓMINA
              </span>
              <span className="text-xs text-white/50 font-mono">Ref: {nomina.id}</span>
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] mt-1">Recibo Individual de Salarios</h2>
            <p className="text-xs text-white/60">
              Confeccionado conforme a la Orden de 27 de diciembre de 1994 y Ley del Estatuto de los Trabajadores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-2xl transition-colors p-1"
            aria-label="Cerrar nómina"
          >
            &times;
          </button>
        </div>

        {/* Encabezado: Empresa y Trabajador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/5">
          <div className="space-y-1">
            <span className="font-bold text-purple-300 uppercase block tracking-wider text-[11px]">Empresa</span>
            <div className="text-sm font-bold text-white">DM CAR TALLER MECÁNICO S.L.</div>
            <div className="text-white/60">CIF: B12345678 · CCC: 28/1234567/89</div>
            <div className="text-white/60">CNAE: 4520 Mantenimiento y reparación de vehículos</div>
            <div className="text-white/60">Domicilio: Calle Metalurgia 18, 28830 Madrid</div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-emerald-300 uppercase block tracking-wider text-[11px]">Trabajador</span>
            <div className="text-sm font-bold text-white">{nomina.empleadoNombre}</div>
            <div className="text-white/60">NIF: <span className="font-mono text-white">{nomina.empleadoNif}</span> · Nº Afiliación SS: 28/9876543210</div>
            <div className="text-white/60">
              Grupo Cotización: <strong className="text-white">G{nomina.grupoCotizacion}</strong> ({grupoInfo?.categoria})
            </div>
            <div className="text-white/60">Período de liquidación: <strong className="text-white">Octubre 2026 (30 días)</strong></div>
          </div>
        </div>

        {/* I. DEVENGOS */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-white border-b border-white/10 pb-1">
            <span className="uppercase tracking-wider text-[11px] text-[#c4b5fd]">I. Devengos</span>
            <span>Importe</span>
          </div>

          <div className="space-y-1 pl-2">
            <div className="font-semibold text-white/80 text-[11px]">1. Percepciones Salariales:</div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Salario Base Mensual</span>
              <span className="font-mono">{formatCurrency(nomina.devengosSalariales.salarioBase)}</span>
            </div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Complementos Salariales / Plus Convenio</span>
              <span className="font-mono">{formatCurrency(nomina.devengosSalariales.complementos)}</span>
            </div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Prorrata Pagas Extraordinarias</span>
              <span className="font-mono">{formatCurrency(nomina.devengosSalariales.prorrataPagas)}</span>
            </div>

            {nomina.devengosNoSalariales.totalNoSalarial > 0 && (
              <>
                <div className="font-semibold text-white/80 text-[11px] pt-1">2. Percepciones No Salariales (Indemnizaciones / Suplidos):</div>
                <div className="flex justify-between text-white/70 pl-3">
                  <span>Plus Distancia y Transporte exento</span>
                  <span className="font-mono">{formatCurrency(nomina.devengosNoSalariales.dietasYTransporte)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center font-bold text-white pt-2 border-t border-white/5 bg-white/[0.02] p-2 rounded-lg">
            <span>A. TOTAL DEVENGADO (Salario Bruto)</span>
            <span className="font-mono text-sm text-purple-300">{formatCurrency(nomina.totalDevengadoBruto)}</span>
          </div>
        </div>

        {/* II. DEDUCCIONES */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-white border-b border-white/10 pb-1">
            <span className="uppercase tracking-wider text-[11px] text-[#f5c451]">II. Deducciones</span>
            <span>Importe</span>
          </div>

          <div className="space-y-1 pl-2">
            <div className="font-semibold text-white/80 text-[11px]">1. Aportación del Trabajador a la Seguridad Social:</div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Contingencias Comunes (4,70%)</span>
              <span className="font-mono text-amber-300">-{formatCurrency(nomina.deduccionesTrabajador.contingenciasComunes)}</span>
            </div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Desempleo (1,55% / 1,60%)</span>
              <span className="font-mono text-amber-300">-{formatCurrency(nomina.deduccionesTrabajador.desempleo)}</span>
            </div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Formación Profesional (0,10%)</span>
              <span className="font-mono text-amber-300">-{formatCurrency(nomina.deduccionesTrabajador.formacionProfesional)}</span>
            </div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Mecanismo de Equidad Intergeneracional MEI (0,14%)</span>
              <span className="font-mono text-amber-300">-{formatCurrency(nomina.deduccionesTrabajador.mei)}</span>
            </div>

            <div className="font-semibold text-white/80 text-[11px] pt-1">2. Impuesto sobre la Renta de las Personas Físicas (IRPF):</div>
            <div className="flex justify-between text-white/70 pl-3">
              <span>Retención IRPF a cuenta</span>
              <span className="font-mono text-rose-300">-{formatCurrency(nomina.deduccionesTrabajador.retencionIrpf)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center font-bold text-white pt-2 border-t border-white/5 bg-white/[0.02] p-2 rounded-lg">
            <span>B. TOTAL A DEDUCIR</span>
            <span className="font-mono text-sm text-rose-400">-{formatCurrency(nomina.deduccionesTrabajador.totalDeducciones)}</span>
          </div>
        </div>

        {/* LÍQUIDO TOTAL A PERCIBIR */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 flex justify-between items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold">LÍQUIDO TOTAL A PERCIBIR (Transferencia Bancaria)</div>
            <div className="text-[11px] text-white/50">Sueldo neto abonado en la cuenta del trabajador</div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(nomina.liquidoTotalAPercibir)}
          </div>
        </div>

        {/* Bases de Cotización y Aportación de la Empresa */}
        <div className="text-[11px] bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1 text-white/60">
          <div className="font-bold text-white text-xs mb-1">Determinación de las Bases de Cotización y Aportación Empresarial (TGSS):</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Base Contingencias Comunes: <strong className="text-white font-mono">{formatCurrency(nomina.baseCotizacionContingenciasComunes)}</strong></div>
            <div>Base Accidentes (AT/EP): <strong className="text-white font-mono">{formatCurrency(nomina.baseCotizacionContingenciasProfesionales)}</strong></div>
            <div>Base Sujeta IRPF: <strong className="text-white font-mono">{formatCurrency(nomina.baseSujetaIrpf)}</strong></div>
            <div>Aportación Total Empresa: <strong className="text-white font-mono">{formatCurrency(nomina.costeSeguridadSocialEmpresa.totalSeguridadSocialEmpresa)}</strong></div>
          </div>
        </div>

        {/* Pie de firma */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
          <div className="text-white/40 text-[11px]">
            Sello y Firma Digital de DM Car Taller Mecánico S.L. · Emitida el 31/10/2026
          </div>
          <button
            onClick={() => {
              window.print();
            }}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg border border-white/15 transition-all flex items-center gap-2"
          >
            <span>🖨️ Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
