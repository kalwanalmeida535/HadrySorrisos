
import React from 'react';
import { Appointment, AppointmentStatus } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  isDentist: boolean;
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
      case AppointmentStatus.AGENDADO: return 'bg-status-scheduled border-yellow-200';
      case AppointmentStatus.CONFIRMADO: return 'bg-status-confirmed border-green-200';
      case AppointmentStatus.CANCELADO: return 'bg-status-cancelled border-red-200';
      case AppointmentStatus.ATRASADO: return 'bg-status-late border-orange-200';
      default: return 'bg-white border-2 border-dashed border-primary/40';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.AGENDADO: return 'Agendado';
      case AppointmentStatus.CONFIRMADO: return 'Confirmado';
      case AppointmentStatus.CANCELADO: return 'Cancelado';
      case AppointmentStatus.ATRASADO: return 'Atrasado';
      case AppointmentStatus.DISPONIVEL: return 'Livre';
    }
  };

  return (
    <div className={`p-5 rounded-3xl border transition-all hover:shadow-lg ${getStatusClasses(appointment.status)}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-2xl font-black text-gray-800 tracking-tighter">{appointment.time}</span>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${appointment.status === AppointmentStatus.DISPONIVEL ? 'bg-primary/20 text-primary-dark' : 'bg-black/10 text-black/60'}`}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>

      {appointment.patientName ? (
        <div className="mb-4 space-y-1">
          <p className="font-bold text-gray-800 text-lg leading-tight">{appointment.patientName}</p>
          <p className="text-xs font-medium text-gray-600 flex items-center gap-1 opacity-70">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {appointment.patientPhone}
          </p>
          {appointment.treatment && (
            <div className="mt-2 py-1 px-3 bg-white/40 rounded-xl inline-block border border-white/20">
              <p className="text-[11px] font-bold text-gray-700">📌 {appointment.treatment}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-gray-400 font-medium italic">Horário vago</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {appointment.status === AppointmentStatus.DISPONIVEL ? (
          <button 
            onClick={() => onBook?.(appointment.id)}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-gray-800 font-bold rounded-2xl transition-all shadow-sm"
          >
            Agendar Paciente
          </button>
        ) : (
          <>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CONFIRMADO)}
              title="Confirmar"
              className="flex-1 min-w-[40px] py-2 bg-white/50 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-wider text-green-700 transition-colors border border-green-200"
            >
              V
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.ATRASADO)}
              title="Paciente Atrasado"
              className="flex-1 min-w-[40px] py-2 bg-white/50 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-wider text-orange-700 transition-colors border border-orange-200"
            >
              ⏱️
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.CANCELADO)}
              title="Cancelar"
              className="flex-1 min-w-[40px] py-2 bg-white/50 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-wider text-red-700 transition-colors border border-red-200"
            >
              X
            </button>
            <button 
              onClick={() => onStatusChange?.(appointment.id, AppointmentStatus.DISPONIVEL)}
              className="w-full py-2 bg-white/50 hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-500 transition-colors border border-gray-200 mt-1"
            >
              Disponibilizar Horário
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
