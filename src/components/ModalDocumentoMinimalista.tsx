import React, { useState } from 'react';
import { formatCurrency, formatDateES } from '../modules/fiscal/engine';

export type TipoDocumentoMinimalista = 'FACTURA' | 'PRESUPUESTO' | 'RECIBO' | 'ORDEN_TRABAJO' | 'SOLICITUD';

export interface DocumentoMinimalistaData {
  tipo: TipoDocumentoMinimalista;
  id: string; // ej: F260001, P260082, R260001, OT260001, S260000
  fecha: string;
  fechaPropuestaEntrega?: string; // ej: 12/10/2026
  expedienteId?: string; // ej: EXP-2026-0842
  solicitudId?: string;
  estado: string; // ej: 'COBRADA_TOTAL', 'ACEPTADO', 'FINALIZADA', 'EN_CURSO', 'ENVIADO'
  emisor: {
    nombre: string;
    cif: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  cliente: {
    razonSocial: string;
    cifNif: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  vehiculo?: {
    marcaModelo: string;
    matricula: string;
    km?: string;
    bastidor?: string;
  };
  lineas: Array<{
    concepto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
  }>;
  totales: {
    baseImponible: number;
    tipoIva: number; // 21
    cuotaIva: number;
    total: number;
    cobrado?: number;
    pendiente?: number;
  };
  metodoPago?: string;
  observaciones?: string;
}

interface ModalDocumentoMinimalistaProps {
  documento: DocumentoMinimalistaData;
  onClose: () => void;
  onNotice?: (msg: string) => void;
}

export const ModalDocumentoMinimalista: React.FC<ModalDocumentoMinimalistaProps> = ({
  documento,
  onClose,
  onNotice = () => {}
}) => {
  const [clienteEliminado, setClienteEliminado] = useState(false);

  const handleEliminarCliente = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClienteEliminado(true);
    onNotice(`🗑️ Cliente ${documento.cliente.razonSocial} eliminado de la tarjeta del documento.`);
  };

  const getTipoLabel = () => {
    switch (documento.tipo) {
      case 'FACTURA':
        return 'Factura Oficial Ordinaria';
      case 'PRESUPUESTO':
        return 'Presupuesto Técnico Detallado';
      case 'RECIBO':
        return 'Recibo Oficial de Pago / Cobro';
      case 'ORDEN_TRABAJO':
        return 'Orden de Trabajo y Taller';
      case 'SOLICITUD':
        return 'Solicitud de Presupuesto Inicial';
      default:
        return 'Documento Oficial Gestarian';
    }
  };

  const getBorderColorClass = () => {
    const est = documento.estado.toUpperCase();
    if (est.includes('COBRADA') || est.includes('ACEPTADO') || est.includes('FINALIZADA')) {
      return 'border-emerald-500/50 shadow-[0_0_35px_-8px_rgba(34,197,94,0.35)]';
    }
    if (est.includes('CURSO') || est.includes('PARCIAL') || est.includes('TALLER')) {
      return 'border-[#a855f7]/50 shadow-[0_0_35px_-8px_rgba(168,85,247,0.35)]';
    }
    if (est.includes('ENVIADO') || est.includes('EMITIDA')) {
      return 'border-[#38bdf8]/50 shadow-[0_0_35px_-8px_rgba(56,189,248,0.35)]';
    }
    return 'border-amber-500/50 shadow-[0_0_35px_-8px_rgba(245,196,81,0.35)]';
  };

  const getBadgeColorClass = () => {
    const est = documento.estado.toUpperCase();
    if (est.includes('COBRADA') || est.includes('ACEPTADO') || est.includes('FINALIZADA')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (est.includes('CURSO') || est.includes('PARCIAL') || est.includes('TALLER')) {
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
    if (est.includes('ENVIADO') || est.includes('EMITIDA')) {
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  };

  const handlePrint = () => {
    window.print();
    onNotice(`🖨️ Documento ${documento.id} enviado a la cola de impresión.`);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola ${documento.cliente.razonSocial}, le remitimos su ${getTipoLabel()} con ref. ${documento.id} por importe de ${formatCurrency(documento.totales.total)}. DM CAR TALLER.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    onNotice(`💬 Enlace de ${documento.id} generado para WhatsApp.`);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${getTipoLabel()} ${documento.id} · DM CAR TALLER MECÁNICO`);
    const body = encodeURIComponent(
      `Estimado/a ${documento.cliente.razonSocial}:\n\nAdjuntamos la información correspondiente al documento ${documento.id} por importe total de ${formatCurrency(documento.totales.total)}.\n\nAtentamente,\nDM CAR TALLER MECÁNICO S.L.`
    );
    window.location.href = `mailto:${documento.cliente.email || ''}?subject=${subject}&body=${body}`;
    onNotice(`📧 Correo preparado con ${documento.id}.`);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(documento, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${documento.id}_minimalista.json`);
    dlAnchor.click();
    onNotice(`💾 Fichero de ${documento.id} exportado con éxito.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      {/* Tarjeta de Documento Minimalista */}
      <div className={`relative bg-[#070712] border ${getBorderColorClass()} rounded-2xl max-w-3xl w-full p-6 md:p-9 space-y-6 text-white my-auto transition-all animate-fade-in shadow-2xl pb-24`}>
        
        {/* Cabecera Minimalista Superior */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColorClass()} tracking-wide uppercase`}>
                {documento.tipo} · {documento.estado}
              </span>
              {documento.expedienteId && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
                  📁 {documento.expedienteId}
                </span>
              )}
              {documento.solicitudId && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
                  📝 {documento.solicitudId}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-['Outfit'] tracking-tight text-white mt-1">
              {getTipoLabel()}
            </h1>
            <div className="font-mono text-sm md:text-base font-bold text-white/90">
              Nº: <span className="text-white underline decoration-white/30">{documento.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <div className="text-white/50 text-[11px]">Fecha de Emisión:</div>
              <div className="font-mono font-bold text-white">{formatDateES(documento.fecha)}</div>
              {documento.fechaPropuestaEntrega && (
                <div className="mt-1 pt-1 border-t border-white/10">
                  <div className="text-amber-300/80 text-[10px] font-semibold">Fecha Propuesta Entrega:</div>
                  <div className="font-mono font-bold text-amber-300">{formatDateES(documento.fechaPropuestaEntrega)}</div>
                </div>
              )}
            </div>

            {/* Icono Minimalista Flotante en Encabezado (Sin Relleno) */}
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
              {documento.tipo === 'FACTURA' && (
                <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              )}
              {documento.tipo === 'PRESUPUESTO' && (
                <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              )}
              {documento.tipo === 'RECIBO' && (
                <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-5 0c0 2 3 2.5 3 4.5a3.5 3.5 0 0 1-5 0"></path>
                </svg>
              )}
              {documento.tipo === 'ORDEN_TRABAJO' && (
                <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              )}
              {documento.tipo === 'SOLICITUD' && (
                <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Datos Empresa y Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Emisor / Taller</span>
            <div className="text-sm font-bold text-white">{documento.emisor.nombre}</div>
            <div className="text-white/60 font-mono">CIF: {documento.emisor.cif}</div>
            <div className="text-white/60">{documento.emisor.direccion}</div>
            <div className="text-white/50">{documento.emisor.telefono} · {documento.emisor.email}</div>
          </div>

          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Cliente / Titular</span>
              
              {/* Iconos de la tarjeta de clientes: Llamar, WhatsApp, Email y Eliminar Cliente */}
              <div className="flex items-center gap-2">
                {documento.cliente.telefono && (
                  <a
                    href={`tel:${documento.cliente.telefono}`}
                    title={`Llamar a ${documento.cliente.telefono}`}
                    className="text-white/40 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </a>
                )}
                {documento.cliente.telefono && (
                  <a
                    href={`https://wa.me/${documento.cliente.telefono.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Enviar WhatsApp al cliente"
                    className="text-white/40 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </a>
                )}
                {documento.cliente.email && (
                  <a
                    href={`mailto:${documento.cliente.email}`}
                    title={`Enviar correo a ${documento.cliente.email}`}
                    className="text-white/40 hover:text-sky-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </a>
                )}
                {/* Botón flotante eliminar cliente: cubo de basura, sin relleno, sin envoltorio */}
                <button
                  type="button"
                  onClick={handleEliminarCliente}
                  title="Eliminar cliente"
                  aria-label="Eliminar cliente"
                  className="text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>

            {clienteEliminado ? (
              <div className="py-2 text-rose-300 text-xs flex items-center justify-between">
                <span className="italic">🗑️ Cliente desvinculado / eliminado</span>
                <button
                  type="button"
                  onClick={() => setClienteEliminado(false)}
                  className="text-[11px] underline text-white/50 hover:text-white"
                >
                  Deshacer
                </button>
              </div>
            ) : (
              <>
                <div className="text-sm font-bold text-white">{documento.cliente.razonSocial}</div>
                <div className="text-white/60 font-mono">NIF / CIF: {documento.cliente.cifNif}</div>
                {documento.cliente.direccion && <div className="text-white/60">{documento.cliente.direccion}</div>}
                <div className="text-white/50">
                  {documento.cliente.telefono || 'Sin teléfono'} · {documento.cliente.email || 'Sin email'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ficha del Vehículo & Fecha Entrega (Si Aplica) */}
        {documento.vehiculo && (
          <div className="bg-gradient-to-r from-white/[0.04] to-white/[0.01] p-3.5 rounded-xl border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="13" rx="2"></rect>
                  <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"></path>
                </svg>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">Vehículo Vinculado</span>
                <span className="font-semibold text-white text-sm">{documento.vehiculo.marcaModelo}</span>
                {documento.vehiculo.km && <span className="text-white/50 text-[11px] ml-2">({documento.vehiculo.km} km)</span>}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-white/40 text-[10px] block">Matrícula:</span>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-bold text-white tracking-widest">
                  {documento.vehiculo.matricula}
                </span>
              </div>
              {documento.fechaPropuestaEntrega && (
                <div>
                  <span className="text-amber-300/60 text-[10px] block">Entrega Estimada:</span>
                  <span className="text-amber-300 font-bold">{formatDateES(documento.fechaPropuestaEntrega)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabla Minimalista de Líneas */}
        <div className="overflow-x-auto border border-white/8 rounded-xl bg-white/[0.01]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/8 text-white/40 uppercase tracking-wider text-[10px] bg-white/[0.02]">
                <th className="p-3">Descripción / Partida Técnica</th>
                <th className="p-3 text-center">Uds / Horas</th>
                <th className="p-3 text-right">Precio Unitario</th>
                <th className="p-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documento.lineas.map((linea, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 text-white/90 font-medium">{linea.concepto}</td>
                  <td className="p-3 text-center font-mono text-white/70">{linea.cantidad}</td>
                  <td className="p-3 text-right font-mono text-white/70">{formatCurrency(linea.precioUnitario)}</td>
                  <td className="p-3 text-right font-mono font-semibold text-white">{formatCurrency(linea.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen de Totales y Liquidación */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 border-t border-white/10 text-xs">
          <div className="text-white/60 text-[11px] max-w-sm space-y-1">
            {documento.tipo === 'PRESUPUESTO' && (
              <p className="text-amber-300/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                ⚠️ <strong>Nota técnica de facturación:</strong> La factura final oficial se genera únicamente al marcar la parada de reparación o taller como finalizada en el Roadmap de seguimiento.
              </p>
            )}
            {documento.metodoPago && (
              <div>Método de liquidación: <strong className="text-white">{documento.metodoPago}</strong></div>
            )}
            <div className="text-white/40">Gestarian Cloud Engine · Registro tributario y custodia digital conforme a ley.</div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs bg-white/[0.02] p-3.5 rounded-xl border border-white/8">
            <div className="flex justify-between text-white/60">
              <span>Base Imponible:</span>
              <span className="text-white">{formatCurrency(documento.totales.baseImponible)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>IVA ({documento.totales.tipoIva}%):</span>
              <span className="text-white">{formatCurrency(documento.totales.cuotaIva)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
              <span className="font-sans">Total {documento.tipo}:</span>
              <span className="text-amber-300">{formatCurrency(documento.totales.total)}</span>
            </div>
            {documento.totales.cobrado !== undefined && (
              <div className="flex justify-between text-[11px] text-emerald-400 pt-1">
                <span>Cobrado:</span>
                <span>{formatCurrency(documento.totales.cobrado)}</span>
              </div>
            )}
            {documento.totales.pendiente !== undefined && documento.totales.pendiente > 0 && (
              <div className="flex justify-between text-[11px] text-rose-400 font-bold">
                <span>Pendiente:</span>
                <span>{formatCurrency(documento.totales.pendiente)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            BARRA DE ACCIONES CON BOTONES EN FORMA DE ICONOS FLOTANTES
            EN EL PIÉ DEL DOCUMENTO (DISEÑO GESTARIAN QUICK)
            ======================================================== */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0d0d1c]/95 border border-white/20 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.8)] z-10">
          {/* Botón Flotante 1: Imprimir / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            title="Imprimir documento / Exportar PDF"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
          </button>

          {/* Botón Flotante 2: WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            title="Enviar por WhatsApp"
            className="w-10 h-10 rounded-full bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>

          {/* Botón Flotante 3: Email */}
          <button
            type="button"
            onClick={handleEmail}
            title="Enviar por Correo Electrónico"
            className="w-10 h-10 rounded-full bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/20 hover:border-sky-500/40 text-sky-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </button>

          {/* Botón Flotante 4: Descargar / Exportar */}
          <button
            type="button"
            onClick={handleDownload}
            title="Descargar Fichero Oficial"
            className="w-10 h-10 rounded-full bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>

          {/* Divisor vertical sutil */}
          <div className="w-[1px] h-6 bg-white/15"></div>

          {/* Botón Flotante 5: Cerrar */}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar Documento"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-rose-500/20 border border-white/20 hover:border-rose-500/40 text-white/80 hover:text-rose-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
