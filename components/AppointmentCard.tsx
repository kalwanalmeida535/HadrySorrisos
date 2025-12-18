
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
  const getStatusClasses = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.AGENDADO: return 'bg-status-scheduled border-yellow-400';
      case AppointmentStatus.CONFIRMADO: return 'bg-status-confirmed border-green-500 text-white';
      case AppointmentStatus.CANCELADO: return 'bg-status-cancelled border-red-500 text-white';
      default: return 'bg-white border-2 border-dashed border-primary/40';
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
    <div className={`p-5 rounded-[2rem] border transition-all shadow-sm ${getStatusClasses(appointment.status)}`}>
      <div className="flex justify-between items-center mb-4">
        <span className={`text-2xl font-black tracking-tighter ${appointment.status === AppointmentStatus.DISPONIVEL ? 'text-gray-800' : 'text-inherit'}`}>
          {appointment.time}
        </span>
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-black/5">
          {getStatusLabel(appointment.status)}
        </span>
      </div>

      <div className="min-h-[60px]">
        {appointment.patientName ? (
          <div className="mb-4">
            <p className="font-black text-lg leading-none mb-1">{appointment.patientName}</p>
            <p className="text-xs font-bold opacity-80">{appointment.treatment || 'Consulta Geral'}</p>
          </div>
        ) : (
          <p className="text-sm font-bold opacity-40 italic mb-4">Horário vazio</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {appointment.status === AppointmentStatus.DISPONIVEL ? (
          <button 
            onClick={() => onBook?.(appointment.id)}
            className="w-full py-3 bg-white text-gray-800 font-black rounded-2xl text-xs uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-gray-100"
          >
            Agendar Paciente
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CONFIRMADO)}
              className="flex-1 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase transition-all hover:bg-green-700"
            >
              Confirmar
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CANCELADO)}
              className="flex-1 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase transition-all hover:bg-red-700"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.DISPONIVEL)}
              className="w-full py-2 bg-black/10 text-gray-800 rounded-xl text-[9px] font-black uppercase mt-1"
            >
              Limpar Horário
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
