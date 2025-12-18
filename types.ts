
export enum AppointmentStatus {
  DISPONIVEL = 'disponivel',
  AGENDADO = 'agendado',
  CONFIRMADO = 'confirmado',
  CANCELADO = 'cancelado',
  ATRASADO = 'atrasado'
}

export interface Appointment {
  id: string;
  time: string;
  date: string; // Format: YYYY-MM-DD
  patientName?: string;
  patientPhone?: string;
  treatment?: string; // New field for the dentist
  status: AppointmentStatus;
  notes?: string;
}

export type ViewType = 'dentist'; // Only dentist view remains
