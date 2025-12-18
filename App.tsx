
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from './types';
import AppointmentCard from './components/AppointmentCard';
import Calendar from './components/Calendar';
import BookingModal from './components/BookingModal';
import DayConfigModal from './components/DayConfigModal';
import { db } from './services/db';
import { getAgendaSummary } from './services/geminiService';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDayConfigOpen, setIsDayConfigOpen] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const stringifyError = (err: any): string => {
    if (!err) return "Erro desconhecido";
    if (err.message) return err.message;
    return String(err);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await db.fetchAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(stringifyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAISummary = async () => {
    setIsGeneratingSummary(true);
    const dayAppointments = appointments.filter(a => a.date === selectedDate);
    const summary = await getAgendaSummary(dayAppointments);
    setAiSummary(summary);
    setIsGeneratingSummary(false);
  };

  const sync = async (newAppointments: Appointment[]) => {
    try {
      setIsSyncing(true);
      await db.saveAppointments(newAppointments);
      setAppointments(newAppointments);
    } catch (err: any) {
      alert("Erro ao salvar: " + stringifyError(err));
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredAppointments = appointments
    .filter(app => app.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    const updated = appointments.map(app => 
      app.id === id ? { 
        ...app, 
        status: newStatus,
        ...(newStatus === AppointmentStatus.DISPONIVEL ? { patientName: undefined, patientPhone: undefined, treatment: undefined } : {})
      } : app
    );
    await sync(updated);
  };

  const handleOpenBooking = (id: string) => {
    setActiveSlotId(id);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (name: string, phone: string, treatment: string) => {
    if (activeSlotId) {
      const updated = appointments.map(app => 
        app.id === activeSlotId ? { 
          ...app, 
          status: AppointmentStatus.AGENDADO, 
          patientName: name, 
          patientPhone: phone,
          treatment: treatment
        } : app
      );
      await sync(updated);
      setIsBookingModalOpen(false);
      setActiveSlotId(null);
    }
  };

  const generateDaySlots = async (start: number, end: number) => {
    const newSlots: Appointment[] = [];
    for (let h = start; h < end; h++) {
      const timeStr = `${String(h).padStart(2, '0')}:00`;
      const exists = appointments.find(a => a.date === selectedDate && a.time === timeStr);
      if (!exists) {
        newSlots.push({
          id: Math.random().toString(36).substr(2, 9),
          time: timeStr,
          date: selectedDate,
          status: AppointmentStatus.DISPONIVEL
        });
      }
    }
    await sync([...appointments, ...newSlots]);
    setIsDayConfigOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-bounce flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-3xl mb-4 shadow-2xl shadow-primary/50 rotate-12"></div>
          <p className="text-primary-dark font-black tracking-widest uppercase text-xs">Hadry Sorrisos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/30 flex flex-col items-center pb-24 font-sans selection:bg-primary selection:text-white">
      <header className="w-full max-w-6xl px-6 py-10 flex justify-between items-center">
        <div className="flex flex-col leading-[0.7] tracking-tighter italic group cursor-default">
          <span className="text-5xl font-black text-gray-900 group-hover:text-primary transition-colors">Hadry</span>
          <span className="text-5xl font-black text-primary">Sorrisos</span>
        </div>

        <button 
          onClick={() => setIsDayConfigOpen(true)}
          className="bg-primary text-white py-3 px-8 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>⚙️</span> Configurar Dia
        </button>
      </header>

      {isSyncing && (
        <div className="fixed top-6 right-6 bg-primary text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-pulse">
          <span className="text-xs font-black uppercase tracking-widest">Sincronizando...</span>
        </div>
      )}

      <main className="w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="shadow-2xl shadow-primary/10 rounded-[2.5rem] overflow-hidden">
             <Calendar 
               selectedDate={selectedDate} 
               onDateSelect={(d) => { setSelectedDate(d); setAiSummary(null); }}
               appointments={appointments.filter(a => a.status !== AppointmentStatus.DISPONIVEL)}
             />
          </div>
          
          <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/20 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <span className="text-2xl">🪄</span>
                 <h4 className="text-xs font-black text-primary-dark uppercase tracking-widest">Resumo Inteligente</h4>
              </div>
              
              {aiSummary ? (
                <div className="space-y-4">
                  <div className="p-5 bg-pink-50 rounded-[2rem] border border-primary/10">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium italic">{aiSummary}</p>
                  </div>
                  <button 
                    onClick={handleGenerateAISummary}
                    disabled={isGeneratingSummary}
                    className="w-full py-3 text-[10px] font-black text-primary uppercase rounded-xl hover:bg-primary/5 transition-all"
                  >
                    {isGeneratingSummary ? 'Atualizando...' : '↻ Refazer Análise'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingSummary || filteredAppointments.filter(a => a.status !== 'disponivel').length === 0}
                  className="w-full py-6 bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 shadow-xl shadow-primary/30 hover:scale-[1.02]"
                >
                  {isGeneratingSummary ? 'Processando...' : '✦ Gerar Insights'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b-2 border-primary/10 pb-8">
            <div>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-lg text-primary font-black uppercase tracking-[0.2em]">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
              </p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-primary/20 flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{filteredAppointments.length} Horários Hoje</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredAppointments.map(app => (
              <AppointmentCard 
                key={app.id}
                appointment={app}
                onStatusChange={updateStatus}
                onBook={handleOpenBooking}
              />
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-40 bg-white/50 rounded-[4rem] border-4 border-dashed border-primary/20">
              <div className="text-8xl mb-8 grayscale opacity-20">📅</div>
              <p className="text-primary-dark/60 font-black uppercase tracking-widest text-sm mb-10 text-center">
                Nada agendado para este dia.<br/>Vamos organizar sua jornada?
              </p>
              <button 
                onClick={() => setIsDayConfigOpen(true)}
                className="bg-primary text-white py-5 px-14 rounded-3xl text-xs font-black tracking-widest transition-all shadow-2xl shadow-primary/30 hover:bg-primary-dark hover:scale-110 active:scale-95"
              >
                CRIAR GRADE DE HORÁRIOS
              </button>
            </div>
          )}
        </div>
      </main>

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirm={handleConfirmBooking}
        time={appointments.find(a => a.id === activeSlotId)?.time || ""}
      />

      <DayConfigModal 
        isOpen={isDayConfigOpen}
        onClose={() => setIsDayConfigOpen(false)}
        onGenerate={generateDaySlots}
      />

      <footer className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-primary/20 py-6 px-8 flex justify-center text-[11px] text-primary-dark font-black uppercase tracking-[0.5em] z-40">
        Hadry Sorrisos © 2025
      </footer>
    </div>
  );
};

export default App;
