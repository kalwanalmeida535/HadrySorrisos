
import React from 'react';
import { Appointment, AppointmentStatus } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange?: (id: string, newStatus: AppointmentStatus) => void;
  onBook?: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onStatusChange, 
  onBook 
}) => {
  const isAvailable = appointment.status === AppointmentStatus.DISPONIVEL;

  const getStatusClasses = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.AGENDADO: 
        return 'bg-status-scheduled border-yellow-500 shadow-yellow-100';
      case AppointmentStatus.CONFIRMADO: 
        return 'bg-status-confirmed border-green-600 text-white shadow-green-100';
      case AppointmentStatus.CANCELADO: 
        return 'bg-status-cancelled border-red-600 text-white shadow-red-100';
      default: 
        return 'bg-white border-2 border-primary/40 hover:border-primary';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.AGENDADO: return 'AGENDADO';
      case AppointmentStatus.CONFIRMADO: return 'CONFIRMADO';
      case AppointmentStatus.CANCELADO: return 'CANCELADO';
      case AppointmentStatus.DISPONIVEL: return 'DISPONÍVEL';
    }
  };

  return (
    <div className={`group relative p-6 rounded-[3rem] border-b-[16px] transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${getStatusClasses(appointment.status)} ${isAvailable ? 'border-b-primary pink-glow bg-white' : 'border-b-black/10'}`}>
      
      {/* Ícone de Brilho Grande e Evidente para Disponíveis */}
      {isAvailable && (
        <div className="absolute -right-2 -top-2 text-8xl opacity-[0.2] group-hover:opacity-40 group-hover:scale-125 transition-all duration-700 pointer-events-none select-none">
          ✨
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <span className={`text-5xl font-black tracking-tighter leading-none ${isAvailable ? 'text-gray-900' : 'text-inherit'}`}>
            {appointment.time}
          </span>
          {isAvailable && (
            <div className="mt-3 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-[12px] font-black text-primary-dark uppercase tracking-widest">
                HORÁRIO VAGO
              </span>
            </div>
          )}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm ${isAvailable ? 'bg-primary text-white' : 'bg-black/10 text-gray-600'}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>

      <div className="min-h-[90px] flex flex-col justify-center">
        {appointment.patientName ? (
          <div className="mb-4">
            <p className="font-black text-2xl leading-tight mb-1 truncate text-gray-800">{appointment.patientName}</p>
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{appointment.treatment || 'Consulta Geral'}</p>
          </div>
        ) : (
          <div className="flex items-center gap-5 mb-4 group-hover:translate-x-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl shadow-inner animate-pulse">
              ✨
            </div>
            <div>
              <p className="text-lg font-black text-primary uppercase tracking-tight leading-none">Livre agora</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Agende este paciente</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        {isAvailable ? (
          <button 
            onClick={() => onBook?.(appointment.id)}
            className="w-full py-4.5 bg-primary text-white font-black rounded-[1.5rem] text-sm uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 active:scale-95 flex justify-center items-center gap-2"
          >
            <span>✨</span> AGENDAR CONSULTA
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CONFIRMADO)}
              className="flex-1 py-3.5 bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase transition-all hover:bg-green-700 shadow-md active:scale-95"
            >
              Confirmar
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CANCELADO)}
              className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase transition-all hover:bg-red-700 shadow-md active:scale-95"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.DISPONIVEL)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase mt-1 transition-colors"
            >
              Liberar Horário
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
