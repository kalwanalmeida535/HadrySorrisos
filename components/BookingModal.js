
import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const BookingModal = ({ isOpen, onClose, onConfirm, time }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [treatment, setTreatment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onConfirm(name, phone, treatment);
      setName('');
      setPhone('');
      setTreatment('');
    }
  };

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Cadastrar Paciente</h2>
        <p className="text-gray-500 mb-6 text-sm font-medium">Horário: <span className="text-primary-dark font-bold">${time}</span></p>
        
        <form onSubmit=${handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Nome do Paciente</label>
            <input
              type="text"
              required
              value=${name}
              onChange=${(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-black font-bold"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Telefone</label>
            <input
              type="tel"
              required
              value=${phone}
              onChange=${(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-black font-bold"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Tratamento</label>
            <input
              type="text"
              value=${treatment}
              onChange=${(e) => setTreatment(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-black font-bold"
              placeholder="Ex: Limpeza, Canal..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick=${onClose} className="flex-1 py-3 text-gray-400 font-bold">Voltar</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl font-bold bg-primary text-gray-800 shadow-lg">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

export default BookingModal;
