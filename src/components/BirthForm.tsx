import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Send, Globe, Brain, Users } from 'lucide-react';
import CityPicker from './CityPicker';
import CustomDatePicker from './CustomDatePicker';

interface BirthFormProps {
  onSubmit: (data: { date: string; time: string; lat: number; lng: number; locationName?: string; mbti?: string }) => void;
  loading: boolean;
  isPartner?: boolean;
  showMbti?: boolean;
  initialData?: { date: string; time: string; lat: number; lng: number; locationName?: string; mbti?: string } | null;
  transparentBackground?: boolean;
  colorTheme?: 'gold' | 'red';
}

export default function BirthForm({ onSubmit, loading, isPartner, showMbti, initialData, transparentBackground, colorTheme }: BirthFormProps) {
  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (initialData) {
      const [year, month, day] = initialData.date.split('-').map(Number);
      const [hours, minutes] = initialData.time.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    return null;
  });
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(() => {
    if (initialData && initialData.lat !== 0) {
      return { lat: initialData.lat, lng: initialData.lng, name: 'Сохраненный город' };
    }
    return null;
  });
  const [mbti, setMbti] = useState<string>(initialData?.mbti || '');

  const handleCitySelect = (lat: number, lng: number, name: string) => {
    setLocation({ lat, lng, name });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    
    if (!isPartner && !location) return;

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const hours = String(startDate.getHours()).padStart(2, '0');
    const minutes = String(startDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const finalLat = location ? location.lat : 0;
    const finalLng = location ? location.lng : 0;
    const finalLocationName = location ? location.name : undefined;

    onSubmit({ 
      date: dateStr, 
      time: timeStr, 
      lat: finalLat, 
      lng: finalLng, 
      locationName: finalLocationName,
      mbti: mbti || undefined 
    });
  };

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  const iconColorClass = colorTheme === 'red' || isPartner ? 'text-red-500' : 'text-gold';

  return (
    <>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className={`w-full max-w-xl mx-auto space-y-4 md:space-y-6 ${transparentBackground ? '' : 'sm:bg-white/[0.03] p-4 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border-white/5 transition-all'}`}
      >
        <div className="space-y-3 md:space-y-4">
          <div className="space-y-1.5 md:space-y-2 text-left">
            <label className="text-[9px] md:text-xs font-semibold text-gray-400 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Calendar size={12} className={iconColorClass} />
              Дата и время рождения
            </label>
            <CustomDatePicker 
              value={startDate} 
              onChange={setStartDate} 
              colorTheme={colorTheme || (isPartner ? 'red' : 'gold')}
              isPartner={isPartner}
            />
          </div>

          <div className="space-y-1.5 md:space-y-2 text-left">
            <label className="text-[9px] md:text-xs font-semibold text-gray-400 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Globe size={12} className={iconColorClass} />
              Город рождения {isPartner && <span className="text-gray-500 font-normal lowercase tracking-normal font-light">(необязательно)</span>}
            </label>
            <CityPicker 
              onSelect={handleCitySelect} 
              colorTheme={colorTheme || (isPartner ? 'red' : 'gold')} 
              initialValue={location?.name}
            />
            {location && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[8px] md:text-[10px] text-gold/60 ml-1 italic"
              >
                Координаты: {location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°
              </motion.p>
            )}
          </div>

          {showMbti && (
            <div className="space-y-1.5 md:space-y-2 text-left">
              <label className="text-[9px] md:text-xs font-semibold text-gray-400 ml-1 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Brain size={12} className={iconColorClass} />
                Тип личности <span className="text-gray-500 font-normal lowercase tracking-normal font-light">(необязательно)</span>
              </label>
              <div className="relative group text-[15px] md:text-base font-light font-sans">
                <div className={`absolute left-0 top-[40%] -translate-y-1/2 pointer-events-none text-gray-400 opacity-50 ${colorTheme === 'red' || isPartner ? 'group-focus-within:text-red-500 group-focus-within:opacity-100' : 'group-focus-within:text-gold group-focus-within:opacity-100'} transition-all`}>
                  <Brain size={18} />
                </div>
                <select
                  value={mbti}
                  onChange={(e) => setMbti(e.target.value)}
                  className={`w-full appearance-none bg-transparent border-b border-white/10 px-0 pl-8 py-[0.4rem] pb-[0.8rem] min-h-[48px] ${mbti ? 'text-white' : 'text-gray-500'} text-[15px] md:text-base focus:outline-none focus:border-white/30 transition-all font-light font-sans cursor-pointer`}
                >
                  <option value="" className="bg-gray-900 text-gray-500">Неизвестно</option>
                  {mbtiTypes.map(type => (
                     <option key={type} value={type} className="bg-gray-900 text-white">{type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !startDate || (!isPartner && !location)}
          className={`w-full py-4 bg-white text-black font-bold text-[10px] md:text-sm uppercase tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 mt-6`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isPartner ? <Users size={16} /> : <Send size={16} />}
              {isPartner ? "Создать Синастрию" : "Подтвердить данные"}
            </>
          )}
        </button>
      </motion.form>
    </>
  );
}
