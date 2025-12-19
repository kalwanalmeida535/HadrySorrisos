
import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Calendar = ({ selectedDate, onDateSelect, appointments }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(html`<div key=${`empty-${i}`} className="h-10 w-10 sm:h-12 sm:w-12"></div>`);
  }

  const hasAppointment = (dateStr) => {
    return appointments.some(app => app.date === dateStr);
  };

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = dateStr === selectedDate;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    days.push(html`
      <button
        key=${d}
        onClick=${() => onDateSelect(dateStr)}
        className=${`h-10 w-10 sm:h-12 sm:w-12 flex flex-col items-center justify-center rounded-xl text-sm transition-all relative
          ${isSelected ? 'bg-primary text-gray-800 font-bold shadow-md transform scale-105' : 'hover:bg-pink-50 text-gray-600'}
          ${isToday && !isSelected ? 'border border-primary-dark' : ''}
        `}
      >
        ${d}
        ${hasAppointment(dateStr) && html`<span className=${`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-gray-800' : 'bg-primary-dark'}`}></span>`}
      </button>
    `);
  }

  return html`
    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-pink-50 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">${monthNames[month]} ${year}</h2>
        <div className="flex gap-2">
          <button onClick=${() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 hover:bg-pink-50 rounded-full text-gray-400 hover:text-primary-dark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=${2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick=${() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 hover:bg-pink-50 rounded-full text-gray-400 hover:text-primary-dark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=${2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        ${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => html`<div key=${day} className="text-[10px] font-bold text-gray-300 uppercase">${day}</div>`)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        ${days}
      </div>
    </div>
  `;
};

export default Calendar;
