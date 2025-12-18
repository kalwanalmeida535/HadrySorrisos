
import { createClient } from '@supabase/supabase-js';
import { Appointment, AppointmentStatus } from "../types";

const SUPABASE_URL = 'https://vyacududrdslcrdusqbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWN1ZHVkcmRzbGNyZHVzcWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjM5NDgsImV4cCI6MjA4MTU5OTk0OH0.DVyIFP6YTy8zYs1NI9Z7eW3IO6gwu7fKR6w8HB_KP8s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const db = {
  async fetchAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
    return data || [];
  },

  async saveAppointments(appointments: Appointment[]): Promise<void> {
    // Utiliza upsert para sincronizar a lista inteira baseada no ID
    const { error } = await supabase
      .from('appointments')
      .upsert(appointments, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao salvar agendamentos:', error);
      throw error;
    }
  },

  async addSlot(date: string, time: string): Promise<Appointment> {
    const newSlot: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      time,
      status: AppointmentStatus.DISPONIVEL
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([newSlot])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar horário:', error);
      throw error;
    }
    return data;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  async bookSlot(id: string, name: string, phone: string, treatment?: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: AppointmentStatus.AGENDADO, 
        patientName: name, 
        patientPhone: phone, 
        treatment 
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao realizar agendamento:', error);
      throw error;
    }
  }
};
