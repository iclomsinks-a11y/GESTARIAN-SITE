/**
 * Módulo de Exportación a Gestoría (Informes Trimestrales, A3, Sage, XLS y CSV)
 * Soporte oficial para despachos contables y asesorías fiscales españolas.
 */

import { FacturaOperacion, Modelo303Borrador } from './types';
import { NominaCalculada, BorradorModelo111 } from '../laboral/types';

export interface ResumenTrimestralGestoria {
  ejercicio: number;
  trimestre: string;
  totalIngresosBrutos: number;
  totalIvaRepercutido: number;
  totalGastosBrutos: number;
  totalIvaSoportado: number;
  totalCosteLaboral: number;
  totalRetencionesIrpf: number;
  resultadoIva: number;
  resultadoExplotacion: number;
}

export function calcularResumenTrimestral(
  ejercicio: number,
  trimestre: string,
  emitidas: FacturaOperacion[],
  recibidas: FacturaOperacion[],
  nominas: NominaCalculada[]
): ResumenTrimestralGestoria {
  const totalIngresosBrutos = emitidas.reduce((acc, f) => acc + (f.totales_operacion?.base_imponible_total || 0), 0);
  const totalIvaRepercutido = emitidas.reduce((acc, f) => acc + (f.totales_operacion?.cuota_iva_total || 0), 0);

  const totalGastosBrutos = recibidas.reduce((acc, f) => acc + (f.totales_operacion?.base_imponible_total || 0), 0);
  const totalIvaSoportado = recibidas.reduce((acc, f) => acc + (f.totales_operacion?.cuota_iva_total || 0), 0);

  const totalCosteLaboral = nominas.reduce((acc, n) => acc + (n.costeTotalEmpresa || 0), 0);
  const totalRetencionesIrpf = nominas.reduce((acc, n) => acc + (n.deduccionesTrabajador?.retencionIrpf || 0), 0);

  const resultadoIva = totalIvaRepercutido - totalIvaSoportado;
  const resultadoExplotacion = totalIngresosBrutos - totalGastosBrutos - totalCosteLaboral;

  return {
    ejercicio,
    trimestre,
    totalIngresosBrutos,
    totalIvaRepercutido,
    totalGastosBrutos,
    totalIvaSoportado,
    totalCosteLaboral,
    totalRetencionesIrpf,
    resultadoIva,
    resultadoExplotacion
  };
}

/**
 * Genera el fichero de enlace para A3 Software (A3CON / A3Innuva)
 * Formato estándar de asientos con cuentas 430/400, 700/600 y 477/472.
 */
export function generarEnlaceA3(
  emitidas: FacturaOperacion[],
  recibidas: FacturaOperacion[],
  nominas: NominaCalculada[]
): string {
  const lines: string[] = [];
  lines.push(`;=========================================================`);
  lines.push(`; ENLACE CONTABLE A3CON / A3INNUVA - GESTARIAN PRO`);
  lines.push(`; Fecha Generación: ${new Date().toISOString()}`);
  lines.push(`; Formato: Enlace Estándar Asientos y Libros de IVA`);
  lines.push(`;=========================================================`);

  let asientoNum = 1;

  // Facturas Emitidas
  emitidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;
    const pct = f.totales_operacion?.tipo_iva_aplicado || 21;

    lines.push(`ASIENTO|${asientoNum}|${f.fecha_emision}|FAC_EMITIDA|${f.factura_id}`);
    lines.push(`APUNTE|43000000|${f.cliente.razon_social}|DEBE|${total.toFixed(2)}|${f.factura_id}|${f.cliente.cif_nif}`);
    lines.push(`APUNTE|70000000|Venta de servicios y bienes|HABER|${base.toFixed(2)}|${f.factura_id}|`);
    lines.push(`APUNTE|47700021|H.P. IVA Repercutido 21%|HABER|${iva.toFixed(2)}|${f.factura_id}|${pct}%`);
    asientoNum++;
  });

  // Facturas Recibidas / Gastos
  recibidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;
    const pct = f.totales_operacion?.tipo_iva_aplicado || 21;

    lines.push(`ASIENTO|${asientoNum}|${f.fecha_emision}|FAC_RECIBIDA|${f.factura_id}`);
    lines.push(`APUNTE|60000000|Compras y suministros|DEBE|${base.toFixed(2)}|${f.factura_id}|`);
    lines.push(`APUNTE|47200021|H.P. IVA Soportado 21%|DEBE|${iva.toFixed(2)}|${f.factura_id}|${pct}%`);
    lines.push(`APUNTE|40000000|${f.cliente.razon_social}|HABER|${total.toFixed(2)}|${f.factura_id}|${f.cliente.cif_nif}`);
    asientoNum++;
  });

  // Nóminas
  nominas.forEach(n => {
    lines.push(`ASIENTO|${asientoNum}|${n.periodoMes}-28|NOMINA|${n.id}`);
    lines.push(`APUNTE|64000000|Sueldos y Salarios (${n.empleadoNombre})|DEBE|${n.totalDevengadoBruto.toFixed(2)}|${n.id}|${n.empleadoNif}`);
    lines.push(`APUNTE|64200000|Seguridad Social a cargo de la empresa|DEBE|${n.costeSeguridadSocialEmpresa.totalSeguridadSocialEmpresa.toFixed(2)}|${n.id}|`);
    lines.push(`APUNTE|47600000|Organismos de la Seg. Social acreedores|HABER|${(n.deduccionesTrabajador.totalAportacionSeguridadSocial + n.costeSeguridadSocialEmpresa.totalSeguridadSocialEmpresa).toFixed(2)}|${n.id}|`);
    lines.push(`APUNTE|47510000|H.P. Acreedora por retenciones IRPF|HABER|${n.deduccionesTrabajador.retencionIrpf.toFixed(2)}|${n.id}|`);
    lines.push(`APUNTE|46500000|Remuneraciones pendientes de pago|HABER|${n.liquidoTotalAPercibir.toFixed(2)}|${n.id}|`);
    asientoNum++;
  });

  return lines.join('\r\n');
}

/**
 * Genera el fichero de exportación para SAGE 50 / SAGE 200 / ContaPlus
 */
export function generarEnlaceSage(
  emitidas: FacturaOperacion[],
  recibidas: FacturaOperacion[],
  nominas: NominaCalculada[]
): string {
  const lines: string[] = [];
  lines.push(`*SAGE50_CONTAPLUS_EXPORT*`);
  lines.push(`CABECERA;EMPRESA;DM CAR TALLER MECANICO SL;B12345678;${new Date().toISOString().slice(0, 10)}`);
  lines.push(`ASIENTO;FECHA;CUENTA;CONCEPTO;DOCUMENTO;DEBE;HABER;CONTRAPARTIDA;CIF_NIF`);

  let numAsiento = 1001;

  emitidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;

    lines.push(`${numAsiento};${f.fecha_emision};43000001;Fra. ${f.factura_id} ${f.cliente.razon_social};${f.factura_id};${total.toFixed(2)};0.00;70000001;${f.cliente.cif_nif}`);
    lines.push(`${numAsiento};${f.fecha_emision};70000001;Base Imponible ${f.factura_id};${f.factura_id};0.00;${base.toFixed(2)};43000001;`);
    lines.push(`${numAsiento};${f.fecha_emision};47700021;IVA Repercutido 21% Fra. ${f.factura_id};${f.factura_id};0.00;${iva.toFixed(2)};43000001;`);
    numAsiento++;
  });

  recibidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;

    lines.push(`${numAsiento};${f.fecha_emision};60000001;Gasto Fra. ${f.factura_id} ${f.cliente.razon_social};${f.factura_id};${base.toFixed(2)};0.00;40000001;`);
    lines.push(`${numAsiento};${f.fecha_emision};47200021;IVA Soportado 21% Fra. ${f.factura_id};${f.factura_id};${iva.toFixed(2)};0.00;40000001;`);
    lines.push(`${numAsiento};${f.fecha_emision};40000001;Total Factura ${f.factura_id};${f.factura_id};0.00;${total.toFixed(2)};60000001;${f.cliente.cif_nif}`);
    numAsiento++;
  });

  nominas.forEach(n => {
    lines.push(`${numAsiento};${n.periodoMes}-28;64000000;Sueldo ${n.empleadoNombre};NOM-${n.id};${n.totalDevengadoBruto.toFixed(2)};0.00;46500000;${n.empleadoNif}`);
    lines.push(`${numAsiento};${n.periodoMes}-28;64200000;Seguridad Social Empresa ${n.empleadoNombre};NOM-${n.id};${n.costeSeguridadSocialEmpresa.totalSeguridadSocialEmpresa.toFixed(2)};0.00;47600000;`);
    lines.push(`${numAsiento};${n.periodoMes}-28;47600000;SS Total Mes (Trab+Emp);NOM-${n.id};0.00;${(n.deduccionesTrabajador.totalAportacionSeguridadSocial + n.costeSeguridadSocialEmpresa.totalSeguridadSocialEmpresa).toFixed(2)};;`);
    lines.push(`${numAsiento};${n.periodoMes}-28;47510000;H.P. Retenciones IRPF Mod.111;NOM-${n.id};0.00;${n.deduccionesTrabajador.retencionIrpf.toFixed(2)};;`);
    lines.push(`${numAsiento};${n.periodoMes}-28;46500000;Liquido Percibir Banco ${n.empleadoNombre};NOM-${n.id};0.00;${n.liquidoTotalAPercibir.toFixed(2)};;`);
    numAsiento++;
  });

  return lines.join('\r\n');
}

/**
 * Genera el archivo XLS estructurado (formato HTML/XML compatible universal)
 */
export function generarEnlaceXLS(
  emitidas: FacturaOperacion[],
  recibidas: FacturaOperacion[],
  nominas: NominaCalculada[],
  resumen: ResumenTrimestralGestoria
): string {
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Resumen Trimestral">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Concepto</Data></Cell>
    <Cell><Data ss:Type="String">Importe (€)</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Ingresos Brutos (Ventas)</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.totalIngresosBrutos.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">IVA Repercutido</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.totalIvaRepercutido.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Gastos Compras y Suministros</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.totalGastosBrutos.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">IVA Soportado Deducible</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.totalIvaSoportado.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Coste Laboral Nóminas</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.totalCosteLaboral.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Retenciones IRPF Modelo 111</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.totalRetencionesIrpf.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Resultado Liquidación IVA (Mod. 303)</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.resultadoIva.toFixed(2)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Resultado Explotación (Beneficio Neto Estimado)</Data></Cell>
    <Cell><Data ss:Type="Number">${resumen.resultadoExplotacion.toFixed(2)}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Facturas Emitidas">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Número Fra</Data></Cell>
    <Cell><Data ss:Type="String">Fecha</Data></Cell>
    <Cell><Data ss:Type="String">Cliente</Data></Cell>
    <Cell><Data ss:Type="String">CIF/NIF</Data></Cell>
    <Cell><Data ss:Type="String">Base Imponible</Data></Cell>
    <Cell><Data ss:Type="String">% IVA</Data></Cell>
    <Cell><Data ss:Type="String">Cuota IVA</Data></Cell>
    <Cell><Data ss:Type="String">Total</Data></Cell>
   </Row>`;

  emitidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;
    const pct = f.totales_operacion?.tipo_iva_aplicado || 21;

    xml += `
   <Row>
    <Cell><Data ss:Type="String">${f.factura_id}</Data></Cell>
    <Cell><Data ss:Type="String">${f.fecha_emision}</Data></Cell>
    <Cell><Data ss:Type="String">${f.cliente.razon_social}</Data></Cell>
    <Cell><Data ss:Type="String">${f.cliente.cif_nif}</Data></Cell>
    <Cell><Data ss:Type="Number">${base.toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="Number">${pct}</Data></Cell>
    <Cell><Data ss:Type="Number">${iva.toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="Number">${total.toFixed(2)}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Facturas Recibidas">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Número Fra</Data></Cell>
    <Cell><Data ss:Type="String">Fecha</Data></Cell>
    <Cell><Data ss:Type="String">Proveedor</Data></Cell>
    <Cell><Data ss:Type="String">CIF</Data></Cell>
    <Cell><Data ss:Type="String">Base Imponible</Data></Cell>
    <Cell><Data ss:Type="String">Cuota IVA</Data></Cell>
    <Cell><Data ss:Type="String">Total</Data></Cell>
   </Row>`;

  recibidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;

    xml += `
   <Row>
    <Cell><Data ss:Type="String">${f.factura_id}</Data></Cell>
    <Cell><Data ss:Type="String">${f.fecha_emision}</Data></Cell>
    <Cell><Data ss:Type="String">${f.cliente.razon_social}</Data></Cell>
    <Cell><Data ss:Type="String">${f.cliente.cif_nif}</Data></Cell>
    <Cell><Data ss:Type="Number">${base.toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="Number">${iva.toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="Number">${total.toFixed(2)}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}

/**
 * Genera el archivo CSV delimitado por punto y coma con BOM UTF-8
 */
export function generarEnlaceCSV(
  emitidas: FacturaOperacion[],
  recibidas: FacturaOperacion[],
  nominas: NominaCalculada[],
  resumen: ResumenTrimestralGestoria
): string {
  const lines: string[] = [];
  lines.push(`TIPO_REGISTRO;NUMERO;FECHA;TERCERO;CIF_NIF;BASE_IMPONIBLE;TIPO_IVA;CUOTA_IVA;RETENCION_IRPF;TOTAL`);

  // Resumen
  lines.push(`RESUMEN_TRIMESTRAL;${resumen.trimestre};${resumen.ejercicio};BALANCE_TOTAL;-;${resumen.totalIngresosBrutos.toFixed(2)};-;${resumen.resultadoIva.toFixed(2)};${resumen.totalRetencionesIrpf.toFixed(2)};${resumen.resultadoExplotacion.toFixed(2)}`);

  emitidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;
    const pct = f.totales_operacion?.tipo_iva_aplicado || 21;

    lines.push(`EMITIDA;${f.factura_id};${f.fecha_emision};"${f.cliente.razon_social}";${f.cliente.cif_nif};${base.toFixed(2)};${pct}%;${iva.toFixed(2)};0.00;${total.toFixed(2)}`);
  });

  recibidas.forEach(f => {
    const total = f.totales_operacion?.importe_total_factura || 0;
    const base = f.totales_operacion?.base_imponible_total || 0;
    const iva = f.totales_operacion?.cuota_iva_total || 0;
    const pct = f.totales_operacion?.tipo_iva_aplicado || 21;

    lines.push(`RECIBIDA;${f.factura_id};${f.fecha_emision};"${f.cliente.razon_social}";${f.cliente.cif_nif};${base.toFixed(2)};${pct}%;${iva.toFixed(2)};0.00;${total.toFixed(2)}`);
  });

  nominas.forEach(n => {
    lines.push(`NOMINA;NOM-${n.id};${n.periodoMes}-28;"${n.empleadoNombre}";${n.empleadoNif};${n.totalDevengadoBruto.toFixed(2)};-;0.00;${n.deduccionesTrabajador.retencionIrpf.toFixed(2)};${n.liquidoTotalAPercibir.toFixed(2)}`);
  });

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Función universal para descargar ficheros en el navegador
 */
export function descargarFicheroEnNavegador(contenido: string, nombreFichero: string, mimeType: string) {
  const blob = new Blob([contenido], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreFichero;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
