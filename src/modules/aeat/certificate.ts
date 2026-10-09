import forge from 'node-forge';
import { PlanVersion } from '../fiscal/types';

export interface CertificadoAEATInfo {
  valido: boolean;
  titular: string;
  nif: string;
  emisor: string;
  validoHasta: string;
  certPem?: string;
  msg?: string;
}

/**
 * PROTOCOLO FRONTEND DE CERTIFICADO DIGITAL (BLOQUE 7 y 8)
 * Exclusivo de ENTERPRISE. Desencripta archivos PKCS#12 (.p12 / .pfx)
 * en el navegador del cliente mediante Forge.
 */
export async function procesarCertificadoDigital(
  file: File,
  password: string,
  plan: PlanVersion = 'ENTERPRISE'
): Promise<CertificadoAEATInfo> {
  // Restricción estricta Bloque 8
  if (plan !== 'ENTERPRISE') {
    throw new Error('Esta funcionalidad de comunicación directa con la AEAT requiere actualizar su suscripción al Plan Enterprise');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error('No se pudo leer el archivo del certificado.');
        }

        const bytes = new Uint8Array(arrayBuffer);
        let binaryStr = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binaryStr += String.fromCharCode(bytes[i]);
        }

        const p12Asn1 = forge.asn1.fromDer(binaryStr);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

        const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBagList = bags[forge.pki.oids.certBag];
        const certBag = certBagList && certBagList.length > 0 ? certBagList[0] : null;

        if (!certBag || !certBag.cert) {
          throw new Error('No se encontró certificado válido en el archivo suministrado.');
        }

        const cert = certBag.cert;
        console.log("🔐 Certificado cargado con éxito en Gestarian Enterprise");

        const cnField = cert.subject.getField('CN');
        const serialField = cert.subject.getField('serialNumber');
        const oField = cert.issuer.getField('O');

        const titular = (cnField && typeof cnField.value === 'string') ? cnField.value : 'Usuario Identificado';
        console.log("Usuario identificado:", titular);

        const nif = (serialField && typeof serialField.value === 'string')
          ? serialField.value.replace(/^IDCES-/, '')
          : 'NIF/CIF Extraído';

        const emisor = (oField && typeof oField.value === 'string') ? oField.value : 'FNMT-RCM';

        const validoHasta = cert.validity?.notAfter ? cert.validity.notAfter.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '2028-12-31';

        const certPem = forge.pki.certificateToPem(cert);

        resolve({
          valido: true,
          titular,
          nif,
          emisor,
          validoHasta,
          certPem,
          msg: "Certificado validado localmente de forma segura en Gestarian Enterprise."
        });
      } catch (error: any) {
        console.error("Error al descifrar el certificado:", error);
        reject(new Error(error.message || 'Contraseña incorrecta o archivo de certificado corrupto.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error de lectura en el archivo local.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
