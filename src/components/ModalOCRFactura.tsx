import React, { useState } from 'react';
import { FacturaOperacion } from '../modules/fiscal/types';

interface ModalOCRFacturaProps {
  isOpen: boolean;
  onClose: () => void;
  onFacturaDetectada: (factura: FacturaOperacion) => void;
}

export const ModalOCRFactura: React.FC<ModalOCRFacturaProps> = ({
  isOpen,
  onClose,
  onFacturaDetectada
}) => {
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [datosDetectados, setDatosDetectados] = useState<{
    emisor: string;
    cif: string;
    fecha: string;
    base: number;
    iva: number;
    total: number;
    concepto: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSimularCaptura = (tipo: 'TICKET_GASOLINA' | 'PIEZAS_RECAMBIO' | 'SUMINISTRO_LUZ') => {
    setProcesando(true);
    setDatosDetectados(null);

    setTimeout(() => {
      setProcesando(false);
      if (tipo === 'TICKET_GASOLINA') {
        setDatosDetectados({
          emisor: 'REPSOL COMBUSTIBLES Y LUBRICANTES S.A.',
          cif: 'A28003707',
          fecha: new Date().toISOString().slice(0, 10),
          base: 74.38,
          iva: 15.62,
          total: 90.00,
          concepto: 'Gasto carburante vehículo taller diésel e+10'
        });
      } else if (tipo === 'PIEZAS_RECAMBIO') {
        setDatosDetectados({
          emisor: 'DISTRIBUCIONES RECAMBIOS DEL METAL S.L.',
          cif: 'B82910394',
          fecha: new Date().toISOString().slice(0, 10),
          base: 450.00,
          iva: 94.50,
          total: 544.50,
          concepto: 'Kit embrague bimasa + pastillas freno cerámicas'
        });
      } else {
        setDatosDetectados({
          emisor: 'ENDESA ENERGÍA S.A.U.',
          cif: 'A81948077',
          fecha: new Date().toISOString().slice(0, 10),
          base: 185.20,
          iva: 38.89,
          total: 224.09,
          concepto: 'Suministro eléctrico nave taller potencia contratada'
        });
      }
    }, 1100);
  };

  const handleConfirmarYGuardar = () => {
    if (!datosDetectados) return;

    const nuevaFactura: FacturaOperacion = {
      factura_id: `REC-OCR-${Date.now().toString().slice(-4)}`,
      expediente_id: `EXP-GAS-${Date.now().toString().slice(-4)}`,
      tipo_documento: 'ORDINARIA',
      fecha_emision: datosDetectados.fecha,
      version_plan: 'QUICK',
      cliente: {
        cif_nif: datosDetectados.cif,
        razon_social: datosDetectados.emisor,
        email: 'administracion@proveedor.es',
        telefono: '+34 910 000 000',
        direccion: 'Polígono Industrial, Madrid'
      },
      descripcion_servicio: datosDetectados.concepto,
      totales_operacion: {
        base_imponible_total: datosDetectados.base,
        tipo_iva_aplicado: 21,
        cuota_iva_total: datosDetectados.iva,
        importe_total_factura: datosDetectados.total,
        moneda: 'EUR'
      },
      estado_gestion_cobros: {
        abono_acumulado_parcial: datosDetectados.total,
        importe_pendiente_abono: 0,
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
          recibo_id: `REC-${Date.now()}`,
          fecha_pago: datosDetectados.fecha,
          importe_abonado: datosDetectados.total,
          metodo_pago: 'Transferencia Bancaria',
          notas: 'Pago registrado por escaneo OCR de factura recibida'
        }
      ]
    };

    onFacturaDetectada(nuevaFactura);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e0c1d] border border-purple-500/30 rounded-2xl max-w-xl w-full p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📸</span>
            <div>
              <h3 className="text-base font-bold font-['Outfit']">Lectura OCR de Facturas Físicas & Recibos</h3>
              <p className="text-xs text-white/50">Extrae emisor, CIF, base imponible e IVA a partir de foto o ticket.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-lg p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Zona de captura / subida */}
        <div className="border-2 border-dashed border-purple-500/40 rounded-xl p-5 text-center bg-purple-950/10 space-y-3">
          <div className="text-3xl">📷</div>
          <div className="text-xs text-white/80">
            Haz una foto a la factura en papel o ticket o selecciona un ejemplo de prueba:
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button
              onClick={() => handleSimularCaptura('TICKET_GASOLINA')}
              disabled={procesando}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 transition-all"
            >
              ⛽ Ticket Carburante (90 €)
            </button>
            <button
              onClick={() => handleSimularCaptura('PIEZAS_RECAMBIO')}
              disabled={procesando}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 transition-all"
            >
              🔩 Fra. Recambios Taller (544,50 €)
            </button>
            <button
              onClick={() => handleSimularCaptura('SUMINISTRO_LUZ')}
              disabled={procesando}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 transition-all"
            >
              ⚡ Recibo Suministro Luz (224,09 €)
            </button>
          </div>
        </div>

        {/* Estado de análisis */}
        {procesando && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-purple-300 font-medium">Procesando imagen con motor OCR Gestarian Neural...</p>
          </div>
        )}

        {/* Datos detectados */}
        {datosDetectados && !procesando && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span>✓ Factura Reconocida</span>
              </span>
              <span className="text-[11px] text-white/50">{datosDetectados.fecha}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Emisor: <strong className="text-white block truncate">{datosDetectados.emisor}</strong></div>
              <div>CIF / NIF: <strong className="text-purple-300 font-mono block">{datosDetectados.cif}</strong></div>
              <div>Base Imponible: <span className="font-mono text-white block">{datosDetectados.base.toFixed(2)} €</span></div>
              <div>IVA (21%): <span className="font-mono text-purple-300 block">{datosDetectados.iva.toFixed(2)} €</span></div>
              <div className="col-span-2 pt-1 border-t border-emerald-500/20 flex justify-between items-center text-sm">
                <span>Total Factura:</span>
                <strong className="text-emerald-400 font-mono text-base">{datosDetectados.total.toFixed(2)} €</strong>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          {datosDetectados && (
            <button
              onClick={handleConfirmarYGuardar}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg transition-all"
            >
              Guardar en Facturas Recibidas
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
