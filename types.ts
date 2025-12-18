
export enum AppointmentStatus {
  DISPONIVEL = 'disponivel',
  AGENDADO = 'agendado',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado'
}

export interface Appointment {
  id: string;
  time: string;
  date: string; // Formato: YYYY-MM-DD
  patientName?: string;
  patientPhone?: string;
  treatment?: string;
  status: AppointmentStatus;
}
