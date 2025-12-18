
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from './types';
import AppointmentCard from './components/AppointmentCard';
import Calendar from './components/Calendar';
import BookingModal from './components/BookingModal';
import DayConfigModal from './components/DayConfigModal';
import { getAgendaSummary } from './services/geminiService';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDayConfigOpen, setIsDayConfigOpen] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('odonto_facil_appointments_v3');
    if (saved) {
      setAppointments(JSON.parse(saved));
    } else {
      const today = new Date().toISOString().split('T')[0];
      const defaults = [
        { id: '1', time: '09:00', date: today, status: AppointmentStatus.DISPONIVEL },
        { id: '2', time: '10:00', date: today, status: AppointmentStatus.DISPONIVEL },
        { id: '3', time: '11:00', date: today, status: AppointmentStatus.DISPONIVEL },
      ];
      setAppointments(defaults);
    }
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem('odonto_facil_appointments_v3', JSON.stringify(appointments));
    }
  }, [appointments]);

  const filteredAppointments = appointments
    .filter(app => app.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const updateStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { 
        ...app, 
        status: newStatus,
        ...(newStatus === AppointmentStatus.DISPONIVEL ? { patientName: undefined, patientPhone: undefined, treatment: undefined } : {})
      } : app
    ));
  };

  const handleOpenBooking = (id: string) => {
    setActiveSlotId(id);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (name: string, phone: string, treatment: string) => {
    if (activeSlotId) {
      setAppointments(prev => prev.map(app => 
        app.id === activeSlotId ? { 
          ...app, 
          status: AppointmentStatus.AGENDADO, 
          patientName: name, 
          patientPhone: phone,
          treatment: treatment
        } : app
      ));
      setIsBookingModalOpen(false);
      setActiveSlotId(null);
    }
  };

  const generateDaySlots = (start: number, end: number) => {
    const newSlots: Appointment[] = [];
    for (let h = start; h < end; h++) {
      const timeStr = `${String(h).padStart(2, '0')}:00`;
      // Check if slot already exists
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
    setAppointments(prev => [...prev, ...newSlots]);
    setIsDayConfigOpen(false);
  };

  const fetchAISummary = async () => {
    setLoadingSummary(true);
    const text = await getAgendaSummary(filteredAppointments);
    setSummary(text);
    setLoadingSummary(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full max-w-5xl px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-start leading-[0.8] tracking-tighter italic">
          <span className="text-4xl font-black text-gray-800">Hadry</span>
          <span className="text-4xl font-black text-primary-dark">Sorrisos</span>
        </div>

        <button 
          onClick={() => setIsDayConfigOpen(true)}
          className="bg-white border-2 border-primary/20 hover:border-primary text-primary-dark py-2.5 px-6 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all shadow-sm"
        >
          ⚙️ Configurar Dia
        </button>
      </header>

      <main className="w-full max-w-5xl px-4 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-6">
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate}
            appointments={appointments.filter(a => a.status !== AppointmentStatus.DISPONIVEL)}
          />

          <div className="p-6 bg-white rounded-3xl shadow-sm border border-pink-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12"></div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight relative z-10">
                <span className="text-primary text-xl">🤖</span> Assistente IA
              </h2>
              <button 
                onClick={fetchAISummary}
                disabled={loadingSummary}
                className="text-[10px] bg-primary/20 hover:bg-primary/40 text-primary-dark font-black py-1 px-3 rounded-full transition-colors relative z-10"
              >
                {loadingSummary ? 'GERANDO...' : 'RESUMIR DIA'}
              </button>
            </div>
            <div className="text-gray-500 text-xs italic leading-relaxed relative z-10 whitespace-pre-wrap">
              {summary || "Analisando sua agenda..."}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-8">
            <div className="flex flex-col">
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
                isDentist={true}
                onStatusChange={updateStatus}
                onBook={handleOpenBooking}
              />
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 transition-all hover:border-primary/40 group">
              <div className="text-gray-100 mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-300 font-black uppercase tracking-widest text-sm mb-6">Agenda Vazia</p>
              <button 
                onClick={() => setIsDayConfigOpen(true)}
                className="bg-primary/10 hover:bg-primary text-primary-dark hover:text-white py-3 px-8 rounded-full text-xs font-black transition-all"
              >
                GERAR HORÁRIOS PARA HOJE
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

      <footer className="fixed bottom-0 w-full bg-white/60 backdrop-blur-xl border-t border-gray-100 py-3 px-6 flex justify-center text-[10px] text-gray-300 font-black uppercase tracking-widest z-40">
        HadrySorrisos | Gestão Inteligente
      </footer>
    </div>
  );
};

export default App;
