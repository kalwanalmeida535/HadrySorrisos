
import { Appointment, AppointmentStatus } from "../types";

const DB_KEY = 'hadry_sorrisos_db_v1';

export const db = {
  // Simula busca no servidor com delay
  async fetchAppointments(): Promise<Appointment[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem(DB_KEY);
        resolve(data ? JSON.parse(data) : []);
      }, 300);
    });
  },

  async saveAppointments(appointments: Appointment[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(DB_KEY, JSON.stringify(appointments));
        resolve();
      }, 500);
    });
  },

  async addSlot(date: string, time: string): Promise<Appointment> {
    const appointments = await this.fetchAppointments();
    const newSlot: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      time,
      status: AppointmentStatus.DISPONIVEL
    };
    await this.saveAppointments([...appointments, newSlot]);
    return newSlot;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const appointments = await this.fetchAppointments();
    const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
    await this.saveAppointments(updated);
  },

  async bookSlot(id: string, name: string, phone: string, treatment?: string): Promise<void> {
    const appointments = await this.fetchAppointments();
    const updated = appointments.map(a => 
      a.id === id ? { 
        ...a, 
        status: AppointmentStatus.AGENDADO, 
        patientName: name, 
        patientPhone: phone, 
        treatment 
      } : a
    );
    await this.saveAppointments(updated);
  }
};
