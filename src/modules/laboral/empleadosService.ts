/**
 * Servicio de Gestión de Empleados Autorizados
 * Permite dar de alta a operarios/trabajadores y enviarles automáticamente el enlace
 * de instalación y descarga de la aplicación por Email y WhatsApp.
 */

import { Empleado } from './types';

export interface EmpleadoAutorizadoUsuario {
  id: string;
  empleadoId: string;
  nombre: string;
  email: string;
  telefono: string;
  rolAcceso: 'MECANICO_OPERARIO' | 'ADMINISTRATIVO' | 'JEFE_TALLER';
  permisos: {
    ficharJornada: boolean;
    verNominasPropias: boolean;
    verPartesTrabajo: boolean;
    accesoFacturacion: boolean;
  };
  fechaAlta: string;
  invitacionEnviadaEmail: boolean;
  invitacionEnviadaWhatsApp: boolean;
}

export const EMPLEADOS_AUTORIZADOS_MOCK: EmpleadoAutorizadoUsuario[] = [
  {
    id: 'AUTH-USER-001',
    empleadoId: 'EMP-001',
    nombre: 'Carlos Mendoza Díaz',
    email: 'carlos.mendoza@gestarian-taller.es',
    telefono: '+34 611 223 344',
    rolAcceso: 'JEFE_TALLER',
    permisos: {
      ficharJornada: true,
      verNominasPropias: true,
      verPartesTrabajo: true,
      accesoFacturacion: true
    },
    fechaAlta: '2026-01-15',
    invitacionEnviadaEmail: true,
    invitacionEnviadaWhatsApp: true
  },
  {
    id: 'AUTH-USER-002',
    empleadoId: 'EMP-002',
    nombre: 'Laura Ramos Vega',
    email: 'laura.ramos@gestarian-taller.es',
    telefono: '+34 622 334 455',
    rolAcceso: 'ADMINISTRATIVO',
    permisos: {
      ficharJornada: true,
      verNominasPropias: true,
      verPartesTrabajo: false,
      accesoFacturacion: true
    },
    fechaAlta: '2026-02-01',
    invitacionEnviadaEmail: true,
    invitacionEnviadaWhatsApp: true
  },
  {
    id: 'AUTH-USER-003',
    empleadoId: 'EMP-003',
    nombre: 'Alejandro Gil Soto',
    email: 'alejandro.gil@gestarian-taller.es',
    telefono: '+34 633 445 566',
    rolAcceso: 'MECANICO_OPERARIO',
    permisos: {
      ficharJornada: true,
      verNominasPropias: true,
      verPartesTrabajo: true,
      accesoFacturacion: false
    },
    fechaAlta: '2026-05-01',
    invitacionEnviadaEmail: true,
    invitacionEnviadaWhatsApp: true
  }
];

export function darDeAltaEmpleadoAutorizado(
  empleado: Empleado,
  telefono: string,
  rol: 'MECANICO_OPERARIO' | 'ADMINISTRATIVO' | 'JEFE_TALLER'
): {
  usuario: EmpleadoAutorizadoUsuario;
  mensajeWhatsApp: string;
  enlaceApp: string;
} {
  const enlaceApp = `https://gestarian.com/app/empleado/auth?ref=${empleado.id}&token=emp_${Date.now()}`;
  
  const mensajeWhatsApp = `Hola ${empleado.nombre}, has sido dado de alta como empleado autorizado en GESTARIAN por DM Car Taller. Ya puedes instalar la aplicación en tu móvil para registrar tu jornada laboral (fichajes) y consultar tus nóminas mensuales desde el icono de retribuciones (€). Descárgala aquí: ${enlaceApp}`;

  const usuario: EmpleadoAutorizadoUsuario = {
    id: `AUTH-USER-${Date.now()}`,
    empleadoId: empleado.id,
    nombre: `${empleado.nombre} ${empleado.apellidos}`,
    email: empleado.email,
    telefono,
    rolAcceso: rol,
    permisos: {
      ficharJornada: true,
      verNominasPropias: true,
      verPartesTrabajo: rol !== 'ADMINISTRATIVO',
      accesoFacturacion: rol === 'JEFE_TALLER' || rol === 'ADMINISTRATIVO'
    },
    fechaAlta: new Date().toISOString().split('T')[0],
    invitacionEnviadaEmail: true,
    invitacionEnviadaWhatsApp: true
  };

  return { usuario, mensajeWhatsApp, enlaceApp };
}
