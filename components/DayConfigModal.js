
import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const DayConfigModal = ({ isOpen, onClose, onGenerate }) => {
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

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurar Dia</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Início</label>
              <input 
                type="time" 
                value=${start} 
                onChange=${(e) => setStart(e.target.value)} 
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 font-bold text-black border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Término</label>
              <input 
                type="time" 
                value=${end} 
                onChange=${(e) => setEnd(e.target.value)} 
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 font-bold text-black border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight italic">
            * Isso criará slots de 1 hora para o dia selecionado.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick=${onClose} className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancelar</button>
            <button onClick=${handleApply} className="flex-1 py-3 rounded-2xl font-bold bg-gray-800 text-white shadow-lg hover:bg-black transition-all">Gerar</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default DayConfigModal;
