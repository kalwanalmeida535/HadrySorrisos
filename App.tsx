
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
  
  // Estados para o resumo da IA
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const stringifyError = (err: any): string => {
    if (!err) return "Erro desconhecido";
    if (typeof err === 'string') return err;
    const parts = [];
    if (err.message) parts.push(err.message);
    if (err.details) parts.push(`Detalhes: ${err.details}`);
    if (err.hint) parts.push(`Dica: ${err.hint}`);
    if (err.code) parts.push(`Código: ${err.code}`);
    if (parts.length > 0) return parts.join(' | ');
    if (err instanceof Error) return err.message;
    try {
      const json = JSON.stringify(err);
      if (json !== '{}') return json;
    } catch (e) {}
    return String(err);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.fetchAppointments();
      setAppointments(data);
    } catch (err: any) {
      const errorMessage = stringifyError(err);
      const lowMsg = errorMessage.toLowerCase();
      if (lowMsg.includes('column') || lowMsg.includes('does not exist') || lowMsg.includes('relation')) {
        setError("DATABASE_SETUP_REQUIRED");
      } else {
        setError(errorMessage);
      }
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
      setAiSummary(null); // Reseta o resumo ao mudar dados
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full mb-4 shadow-lg shadow-primary/50"></div>
          <p className="text-primary-dark font-black tracking-widest uppercase text-[10px]">Hadry Sorrisos | Carregando...</p>
        </div>
      </div>
    );
  }

  if (error === "DATABASE_SETUP_REQUIRED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl max-w-lg border-2 border-primary/20 text-center">
          <div className="text-5xl mb-6">⚙️</div>
          <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase">Banco Não Pronto</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            O banco de dados precisa ser reiniciado para aceitar a nova estrutura.
          </p>
          <div className="bg-gray-900 p-6 rounded-2xl mb-6 text-left overflow-x-auto border-4 border-gray-800">
            <code className="text-[11px] text-green-400 font-mono whitespace-pre leading-relaxed">
{`DROP TABLE IF EXISTS appointments CASCADE;
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  "patientName" TEXT,
  "patientPhone" TEXT,
  treatment TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel'
);
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE appointments TO anon;
GRANT ALL ON TABLE appointments TO authenticated;`}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-primary text-gray-800 font-black rounded-2xl transition-all shadow-lg uppercase"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-20 font-sans">
      <header className="w-full max-w-5xl px-4 py-8 flex justify-between items-center">
        <div className="flex flex-col leading-[0.8] tracking-tighter italic select-none">
          <span className="text-4xl font-black text-gray-800">Hadry</span>
          <span className="text-4xl font-black text-primary-dark">Sorrisos</span>
        </div>

        <button 
          onClick={() => setIsDayConfigOpen(true)}
          className="bg-white border-2 border-primary/20 hover:border-primary text-primary-dark py-2.5 px-6 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm"
        >
          ⚙️ Gerenciar Horários
        </button>
      </header>

      {isSyncing && (
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-md border border-primary/20 px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
          <span className="text-[9px] font-black text-primary-dark uppercase">Sincronizando...</span>
        </div>
      )}

      <main className="w-full max-w-5xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={(d) => { setSelectedDate(d); setAiSummary(null); }}
            appointments={appointments.filter(a => a.status !== AppointmentStatus.DISPONIVEL)}
          />
          
          {/* Card de IA */}
          <div className="bg-gradient-to-br from-white to-pink-50/30 p-6 rounded-[2.5rem] border border-primary/20 shadow-sm overflow-hidden relative group">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-primary-dark uppercase tracking-[0.2em] mb-3">Resumo Inteligente</h4>
              {aiSummary ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed italic">{aiSummary}</p>
                  <button 
                    onClick={handleGenerateAISummary}
                    disabled={isGeneratingSummary}
                    className="text-[9px] font-black text-primary-dark uppercase hover:underline"
                  >
                    {isGeneratingSummary ? 'Atualizando...' : '↻ Atualizar Resumo'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingSummary || filteredAppointments.filter(a => a.status !== 'disponivel').length === 0}
                  className="w-full py-4 bg-primary/20 hover:bg-primary text-primary-dark hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isGeneratingSummary ? 'Gerando...' : '✦ Analisar Agenda do Dia'}
                </button>
              )}
            </div>
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.03] select-none pointer-events-none">✨</div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-black text-gray-800 tracking-tighter">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-sm text-primary-dark font-bold uppercase tracking-wider">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-inner">
              <div className="text-4xl mb-4 opacity-20">📅</div>
              <p className="text-gray-300 font-black uppercase tracking-widest text-xs mb-6 text-center px-4">Sem horários para este dia</p>
              <button 
                onClick={() => setIsDayConfigOpen(true)}
                className="bg-primary/10 hover:bg-primary text-primary-dark hover:text-white py-4 px-10 rounded-2xl text-xs font-black transition-all"
              >
                CONFIGURAR AGENDA
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

      <footer className="fixed bottom-0 w-full bg-white/60 backdrop-blur-xl border-t border-gray-100 py-4 px-6 flex justify-center text-[9px] text-gray-300 font-black uppercase tracking-[0.2em] z-40 select-none">
        Hadry Sorrisos | Gestão Dental Crua & Honesta
      </footer>
    </div>
  );
};

export default App;
