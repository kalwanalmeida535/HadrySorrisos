
import React, { useState } from 'react';

interface DayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (start: number, end: number) => void;
}

const DayConfigModal: React.FC<DayConfigModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('18:00');

  if (!isOpen) return null;

  const handleApply = () => {
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    if (endHour > startHour) {
      onGenerate(startHour, endHour);
    } else {
      alert("O horário de término deve ser após o de início.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurar Dia</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Início</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 outline-none text-black font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Término</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 outline-none text-black font-bold"
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-400 italic">
            * Isso gerará horários vazios de 1 em 1 hora para o dia selecionado. Agendamentos existentes não serão apagados.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 px-4 rounded-2xl font-bold bg-gray-800 text-white hover:bg-black transition-all"
            >
              Gerar Horários
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayConfigModal;
