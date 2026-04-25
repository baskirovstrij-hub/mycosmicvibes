import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, X, Clock, ChevronDown } from 'lucide-react';

const MONTHS = [
  'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
  'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
];

export default function CustomDatePicker({ value, onChange, colorTheme, isPartner }: { value: Date | null, onChange: (d: Date) => void, colorTheme?: 'gold' | 'red', isPartner?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [day, setDay] = useState(value ? value.getDate() : 1);
  const [month, setMonth] = useState(value ? value.getMonth() : 0);
  const [year, setYear] = useState(value ? value.getFullYear() : new Date().getFullYear());
  const [hour, setHour] = useState(value ? value.getHours() : 0);
  const [minute, setMinute] = useState(value ? value.getMinutes() : 0);

  useEffect(() => {
    if (value) {
      setDay(value.getDate());
      setMonth(value.getMonth());
      setYear(value.getFullYear());
      setHour(value.getHours());
      setMinute(value.getMinutes());
    }
  }, [value]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  useEffect(() => {
    if (day > daysInMonth) setDay(daysInMonth);
  }, [month, year, day, daysInMonth]);

  const handleSave = () => {
    const newDate = new Date(year, month, day, hour, minute);
    onChange(newDate);
    setIsOpen(false);
  };

  const formatDisplay = () => {
    if (!value) return '';
    const d = value.getDate().toString().padStart(2, '0');
    const m = MONTHS[value.getMonth()];
    const y = value.getFullYear();
    const hh = value.getHours().toString().padStart(2, '0');
    const mm = value.getMinutes().toString().padStart(2, '0');
    return `${d} ${m} ${y}, ${hh}:${mm}`;
  };

  const SelectWrapper = ({ children, label }: { children: React.ReactNode, label: string }) => (
    <div className="flex flex-col gap-1.5 relative flex-1 min-w-0">
      <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 truncate">{label}</span>
      <div className="relative">
        {children}
        <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );

  const isRed = colorTheme === 'red';
  const iconColor = isRed ? "text-red-500" : "text-purple-400";
  const ringColor = isRed ? "focus-within:ring-red-500/50" : "focus-within:ring-purple-500/50";
  const hoverBorderColor = isRed ? "hover:border-red-500/30" : "hover:border-purple-500/30";
  const focusRing = isRed ? "focus:ring-red-500/50" : "focus:ring-purple-500/50";

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className={`w-full bg-transparent border-b border-white/10 px-0 py-[0.4rem] pb-[0.8rem] min-h-[48px] text-white flex items-center cursor-pointer hover:border-white/30 transition-all group active:scale-[0.98] outline-none relative`}
      >
        <div className={`absolute left-0 top-[40%] -translate-y-1/2 text-gray-400 opacity-50 ${isRed ? 'group-hover:text-red-500' : 'group-hover:text-gold'} group-hover:opacity-100 transition-all`}>
           <Calendar size={18} />
        </div>
        <span className={value ? "text-white font-light text-[15px] md:text-base ml-8 truncate" : "text-gray-500 font-light text-[15px] md:text-base ml-8 truncate"}>
          {value ? formatDisplay() : "Дата и время рождения..."}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div key="modal" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ willChange: 'transform, opacity' }}
              className={`relative w-full max-w-lg ${isRed ? 'bg-red-950/80' : 'bg-slate-900/80'} backdrop-blur-lg border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col gpu-accelerate`}
            >
              <div className="p-6 md:p-8 space-y-6 md:space-y-10 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-light text-white tracking-tight">
                      {isPartner ? "Данные партнера" : "Дата рождения"}
                    </h3>
                  </div>
                  <button type="button" onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-3 md:gap-4">
                  <div className="col-span-3 min-w-0">
                    <SelectWrapper label="День">
                      <select 
                        value={day} 
                        onChange={e => setDay(Number(e.target.value))}
                        className={`w-full appearance-none bg-transparent border-b border-white/10 px-0 py-3 text-center text-white text-lg font-light focus:outline-none focus:border-white/40 transition-all cursor-pointer font-sans`}
                      >
                        {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => (
                          <option key={`day-${d}`} value={d} className="bg-black text-white">{d}</option>
                        ))}
                      </select>
                    </SelectWrapper>
                  </div>
                  <div className="col-span-5 min-w-0">
                    <SelectWrapper label="Месяц">
                      <select 
                        value={month} 
                        onChange={e => setMonth(Number(e.target.value))}
                        className={`w-full appearance-none bg-transparent border-b border-white/10 px-0 py-3 text-center text-white text-lg font-light focus:outline-none focus:border-white/40 transition-all cursor-pointer font-sans`}
                      >
                        {MONTHS.map((m, i) => (
                          <option key={`month-${i}`} value={i} className="bg-black text-white">{m}</option>
                        ))}
                      </select>
                    </SelectWrapper>
                  </div>
                  <div className="col-span-4 min-w-0">
                    <SelectWrapper label="Год">
                      <select 
                        value={year} 
                        onChange={e => setYear(Number(e.target.value))}
                        className={`w-full appearance-none bg-transparent border-b border-white/10 px-0 py-3 text-center text-white text-lg font-light focus:outline-none focus:border-white/40 transition-all cursor-pointer font-sans`}
                      >
                        {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={`year-${y}`} value={y} className="bg-black text-white">{y}</option>
                        ))}
                      </select>
                    </SelectWrapper>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:gap-8 max-w-[240px] mx-auto pt-4">
                  <SelectWrapper label="Час">
                    <select 
                      value={hour} 
                      onChange={e => setHour(Number(e.target.value))}
                      className="w-full appearance-none bg-transparent border-b border-white/10 px-0 py-3 text-center text-white text-2xl font-light focus:outline-none focus:border-white/40 transition-all cursor-pointer font-sans"
                    >
                      {Array.from({length: 24}, (_, i) => i).map(h => (
                        <option key={`hour-${h}`} value={h} className="bg-black text-white">{h.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </SelectWrapper>
                  <div className="text-2xl text-white/20 self-end mb-2 font-light">:</div>
                  <SelectWrapper label="Мин">
                    <select 
                      value={minute} 
                      onChange={e => setMinute(Number(e.target.value))}
                      className="w-full appearance-none bg-transparent border-b border-white/10 px-0 py-3 text-center text-white text-2xl font-light focus:outline-none focus:border-white/40 transition-all cursor-pointer font-sans"
                    >
                      {Array.from({length: 60}, (_, i) => i).map(m => (
                        <option key={`minute-${m}`} value={m} className="bg-black text-white">{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>

                <div className="pt-4">
                  <button 
                    type="button"
                    onClick={handleSave}
                    className={`w-full py-4 text-sm font-bold tracking-[0.3em] uppercase bg-white text-black rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all`}
                  >
                    Готово
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
