
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

    if (error) throw error;
    return data || [];
  },

  async saveAppointments(appointments: Appointment[]): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .upsert(appointments, { onConflict: 'id' });

    if (error) throw error;
  },

  async addSlot(date: string, time: string): Promise<Appointment> {
    const newSlot = {
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

    if (error) throw error;
    return data;
  }
};
