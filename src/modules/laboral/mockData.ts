import { Empleado } from './types';

export const EMPLEADOS_MOCK: Empleado[] = [
  {
    id: 'EMP-001',
    nif: '48920112A',
    nombre: 'Carlos',
    apellidos: 'Mendoza Díaz',
    email: 'carlos.mendoza@gestarian-taller.es',
    grupoCotizacion: 3, // Jefes Administrativos y de Taller (Base mín 2026: 1.435,20 €/mes)
    puesto: 'Jefe de Taller Mecánico',
    cnaeEmpresa: '4520 - Mantenimiento y reparación de vehículos de motor',
    convenioColectivo: 'Convenio Provincial del Metal y Talleres de Reparación',
    tipoContrato: 'INDEFINIDO',
    fechaInicioContrato: '2022-03-01',
    salarioBaseMensual: 2200.00,
    complementosSalariales: 300.00,
    devengosNoSalariales: 80.00, // Plus distancia / transporte exento
    porcentajeIrpf: 15.0,
    prorrateoPagasExtras: true
  },
  {
    id: 'EMP-002',
    nif: '52309144B',
    nombre: 'Laura',
    apellidos: 'Ramos Vega',
    email: 'laura.ramos@gestarian-taller.es',
    grupoCotizacion: 5, // Oficiales Administrativos (Base mín 2026: 1.424,40 €/mes)
    puesto: 'Responsable de Facturación y Atención al Cliente',
    cnaeEmpresa: '4520 - Mantenimiento y reparación de vehículos de motor',
    convenioColectivo: 'Convenio Provincial del Metal y Talleres de Reparación',
    tipoContrato: 'INDEFINIDO',
    fechaInicioContrato: '2023-09-15',
    salarioBaseMensual: 1650.00,
    complementosSalariales: 150.00,
    devengosNoSalariales: 40.00,
    porcentajeIrpf: 12.0,
    prorrateoPagasExtras: true
  },
  {
    id: 'EMP-003',
    nif: '76110928C',
    nombre: 'Alejandro',
    apellidos: 'Gil Soto',
    email: 'alejandro.gil@gestarian-taller.es',
    grupoCotizacion: 8, // Oficiales de primera y segunda (Cotización diaria: 47,48 €/día)
    puesto: 'Mecánico Especialista en Electricidad e Híbridos',
    cnaeEmpresa: '4520 - Mantenimiento y reparación de vehículos de motor',
    convenioColectivo: 'Convenio Provincial del Metal y Talleres de Reparación',
    tipoContrato: 'TEMPORAL',
    fechaInicioContrato: '2026-05-01',
    fechaFinContrato: '2026-10-31', // Fin próximo para alerta SEPE
    periodoPruebaFin: '2026-07-01',
    salarioBaseMensual: 1800.00,
    complementosSalariales: 200.00,
    devengosNoSalariales: 60.00,
    porcentajeIrpf: 13.5,
    prorrateoPagasExtras: true
  }
];
