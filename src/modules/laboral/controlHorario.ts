/**
 * Módulo de Control Horario y Fichajes de Jornada Laboral (España)
 * Cumplimiento del Real Decreto-ley 8/2019 de registro obligatorio de jornada.
 */

export interface RegistroFichaje {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: string; // AAAA-MM-DD
  horaEntrada: string; // HH:MM
  horaSalida?: string; // HH:MM
  pausasMinutos: number;
  horasEfectivas: number;
  tipoJornada: 'COMPLETA' | 'PARCIAL' | 'TURNO';
  ubicacion: string; // ej: "Taller Principal DM Car"
  estado: 'EN_CURSO' | 'COMPLETADA';
}

export const FICHAJES_MOCK: RegistroFichaje[] = [
  {
    id: 'FICH-2026-10-01-01',
    empleadoId: 'EMP-001',
    empleadoNombre: 'Carlos Mendoza Díaz',
    fecha: '2026-10-07',
    horaEntrada: '08:00',
    horaSalida: '17:00',
    pausasMinutos: 60, // 1h comida
    horasEfectivas: 8.0,
    tipoJornada: 'COMPLETA',
    ubicacion: 'Taller Central DM Car (Recepción)',
    estado: 'COMPLETADA'
  },
  {
    id: 'FICH-2026-10-01-02',
    empleadoId: 'EMP-002',
    empleadoNombre: 'Laura Ramos Vega',
    fecha: '2026-10-07',
    horaEntrada: '08:30',
    horaSalida: '17:30',
    pausasMinutos: 60,
    horasEfectivas: 8.0,
    tipoJornada: 'COMPLETA',
    ubicacion: 'Oficina de Administración',
    estado: 'COMPLETADA'
  },
  {
    id: 'FICH-2026-10-01-03',
    empleadoId: 'EMP-003',
    empleadoNombre: 'Alejandro Gil Soto',
    fecha: '2026-10-07',
    horaEntrada: '08:00',
    horaSalida: '16:30',
    pausasMinutos: 30,
    horasEfectivas: 8.0,
    tipoJornada: 'COMPLETA',
    ubicacion: 'Boxes Mecánica y Diagnosis',
    estado: 'COMPLETADA'
  },
  {
    id: 'FICH-2026-10-08-01',
    empleadoId: 'EMP-003',
    empleadoNombre: 'Alejandro Gil Soto',
    fecha: '2026-10-08',
    horaEntrada: '08:00',
    horaSalida: undefined,
    pausasMinutos: 0,
    horasEfectivas: 0,
    tipoJornada: 'COMPLETA',
    ubicacion: 'Boxes Mecánica y Diagnosis',
    estado: 'EN_CURSO'
  }
];

export function registrarFichajeEntrada(
  empleadoId: string,
  empleadoNombre: string,
  ubicacion: string = 'Taller Central DM Car'
): RegistroFichaje {
  const now = new Date();
  const fecha = now.toISOString().split('T')[0];
  const horaEntrada = now.toTimeString().slice(0, 5);

  return {
    id: `FICH-${Date.now()}`,
    empleadoId,
    empleadoNombre,
    fecha,
    horaEntrada,
    pausasMinutos: 0,
    horasEfectivas: 0,
    tipoJornada: 'COMPLETA',
    ubicacion,
    estado: 'EN_CURSO'
  };
}

export function registrarFichajeSalida(
  fichajeActual: RegistroFichaje,
  pausasMinutos: number = 0
): RegistroFichaje {
  const now = new Date();
  const horaSalida = now.toTimeString().slice(0, 5);

  const [hE, mE] = fichajeActual.horaEntrada.split(':').map(Number);
  const [hS, mS] = horaSalida.split(':').map(Number);

  const totalMinutos = (hS * 60 + mS) - (hE * 60 + mE) - pausasMinutos;
  const horasEfectivas = Number(Math.max(0, totalMinutos / 60).toFixed(2));

  return {
    ...fichajeActual,
    horaSalida,
    pausasMinutos,
    horasEfectivas,
    estado: 'COMPLETADA'
  };
}
