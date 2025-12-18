
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
      case AppointmentStatus.DISPONIVEL: return 'LIVRE';
    }
  };

  return (
    <div className={`group relative p-6 rounded-[2.5rem] border-b-[12px] transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${getStatusClasses(appointment.status)} ${isAvailable ? 'border-b-primary shadow-primary/20 bg-white' : 'border-b-black/10'}`}>
      
      {/* Ícone de Brilho Grande para Disponíveis */}
      {isAvailable && (
        <div className="absolute -right-4 -top-4 text-7xl opacity-[0.15] group-hover:opacity-30 group-hover:rotate-45 transition-all duration-500 pointer-events-none">
          ✨
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className={`text-4xl font-black tracking-tighter leading-none ${isAvailable ? 'text-gray-900' : 'text-inherit'}`}>
            {appointment.time}
          </span>
          {isAvailable && (
            <span className="text-[11px] font-black text-primary-dark mt-2 flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-lg w-fit">
              <span className="animate-pulse">✨</span> DISPONÍVEL
            </span>
          )}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${isAvailable ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-black/10'}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>

      <div className="min-h-[80px] flex flex-col justify-center">
        {appointment.patientName ? (
          <div className="mb-4">
            <p className="font-black text-2xl leading-tight mb-1 truncate text-gray-800">{appointment.patientName}</p>
            <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{appointment.treatment || 'Consulta Geral'}</p>
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <p className="text-sm font-black text-primary uppercase tracking-[0.1em]">Horário Livre</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Toque para agendar</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        {isAvailable ? (
          <button 
            onClick={() => onBook?.(appointment.id)}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/40 active:scale-95"
          >
            Agendar Paciente
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CONFIRMADO)}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase transition-all hover:bg-green-700 shadow-md active:scale-95"
            >
              Confirmar
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CANCELADO)}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase transition-all hover:bg-red-700 shadow-md active:scale-95"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.DISPONIVEL)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-[9px] font-black uppercase mt-1 transition-colors"
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
