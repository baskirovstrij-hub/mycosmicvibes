import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Globe, Clock, RefreshCcw, LayoutDashboard, Star } from 'lucide-react';

interface NatalResultProps {
  userData: {
    date: string;
    time: string;
    locationName?: string;
  };
  natalData: any;
  onRecalculate: () => void;
  onViewChart: () => void;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂'
};

const translatePlanet = (p: string) => {
  const map: Record<string, string> = {
    Sun: 'Солнце', Moon: 'Луна', Mercury: 'Меркурий', Venus: 'Венера', Mars: 'Марс'
  };
  return map[p] || p;
};

const translateSign = (s: string) => {
  const map: Record<string, string> = {
    Aries: 'Овен', Taurus: 'Телец', Gemini: 'Близнецы', Cancer: 'Рак',
    Leo: 'Лев', Virgo: 'Дева', Libra: 'Весы', Scorpio: 'Скорпион',
    Sagittarius: 'Стрелец', Capricorn: 'Козерог', Aquarius: 'Водолей', Pisces: 'Рыбы'
  };
  return map[s] || s;
};

export default function NatalResult({ userData, natalData, onRecalculate, onViewChart }: NatalResultProps) {
  const mainPlanets = natalData?.planets?.filter((p: any) => 
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(p.name)
  ) || [];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="relative p-8 rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-lg shadow-2xl overflow-hidden gpu-accelerate">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gold/10 text-gold mb-2">
              <Star size={32} />
            </div>
            <h3 className="text-3xl font-bold text-white">Ваша Карта Сохранена</h3>
            <p className="text-gray-400">Данные вашего рождения успешно рассчитаны и зафиксированы в звездах.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
              <Calendar className="text-gold" size={20} />
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Дата</span>
              <span className="text-white font-medium">{userData.date}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
              <Clock className="text-gold" size={20} />
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Время</span>
              <span className="text-white font-medium">{userData.time}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
              <Globe className="text-gold" size={20} />
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Место</span>
              <span className="text-white font-medium truncate w-full px-2">{userData.locationName || 'Неизвестно'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Основные Положения</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mainPlanets.map((planet: any) => (
                <div key={planet.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-gold">{PLANET_SYMBOLS[planet.name]}</span>
                    <span className="text-sm text-gray-300">{translatePlanet(planet.name)}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{translateSign(planet.sign)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onViewChart}
              className="flex-1 py-4 bg-gold text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
            >
              <LayoutDashboard size={20} />
              Открыть Карту
            </button>
            <button
              onClick={onRecalculate}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw size={20} />
              Пересчитать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
