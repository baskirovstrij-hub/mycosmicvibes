import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Brain, Star, Sparkles, Lock, Zap, ChevronDown } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import DailyVibe from './DailyVibe';
import { MBTI_DESCRIPTIONS, MBTI_LETTERS } from '../constants/mbti';

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

export default function UserProfile() {
  const { natalData, mbtiResult } = useUserStore();
  const [showLetters, setShowLetters] = useState(false);

  const mainPlanets = natalData?.planets?.filter((p: any) => 
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(p.name)
  ) || [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <User className="text-gold" size={36} />
          Ваш Итоговый Профиль
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Синтез вашей астрологической природы и психологического типа личности.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* MBTI Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white/5 border border-emerald-500/30 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Brain size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-sm">
              <Brain size={18} />
              Тип Личности
            </div>
            
            {mbtiResult ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-5xl font-black text-white tracking-tighter">
                  {mbtiResult}
                </div>
                <div className="text-xl font-bold text-emerald-500">
                  {MBTI_DESCRIPTIONS[mbtiResult]?.title}
                </div>
                <p className="text-gray-300 leading-relaxed italic">
                  {MBTI_DESCRIPTIONS[mbtiResult]?.desc}
                </p>
                <p className="text-gray-400 leading-relaxed text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                  {MBTI_DESCRIPTIONS[mbtiResult]?.fullDesc}
                </p>

                {/* Letter Breakdown */}
                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => setShowLetters(!showLetters)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-xs text-white font-bold"
                  >
                    Разбор каждой буквы
                    <ChevronDown className={`transition-transform ${showLetters ? 'rotate-180' : ''}`} size={16} />
                  </button>
                  
                  <AnimatePresence>
                    {showLetters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-2"
                      >
                        {mbtiResult.split('').map((letter, idx) => (
                          <div key={idx} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                            <div className="text-emerald-500 font-bold text-xs">{MBTI_LETTERS[letter]?.label}</div>
                            <div className="text-gray-400 text-[10px] leading-relaxed">{MBTI_LETTERS[letter]?.desc}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <p className="text-gray-400">Вы еще не прошли тест на тип личности.</p>
                <p className="text-sm text-emerald-500/80">Пройдите квиз, чтобы открыть эту часть профиля.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Astrology Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-white/5 border border-gold/30 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Star size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-gold font-bold uppercase tracking-widest text-sm">
              <Star size={18} />
              Натальная Карта
            </div>
            
            {natalData ? (
              <div className="space-y-3 pt-2">
                {mainPlanets.map((planet: any) => (
                  <div key={planet.name} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-gold">{PLANET_SYMBOLS[planet.name]}</span>
                      <span className="font-medium text-gray-200">{translatePlanet(planet.name)}</span>
                    </div>
                    <span className="font-bold text-white">{translateSign(planet.sign)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <p className="text-gray-400">Вы еще не построили натальную карту.</p>
                <p className="text-sm text-gold/80">Введите данные рождения, чтобы открыть эту часть профиля.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Horoscope Section */}
      {natalData && natalData.horoscope && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-sm ml-2">
            <Zap size={18} />
            Ваш Энергетический Прогноз
          </div>
          <DailyVibe horoscope={natalData.horoscope} />
        </motion.div>
      )}

      {/* Future AI Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full p-8 rounded-3xl bg-gradient-to-r from-neon-purple/10 to-blue-500/10 border border-white/10 backdrop-blur-md text-center space-y-4 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-center">
          <div className="p-3 bg-black/50 rounded-2xl border border-white/10">
            <Lock className="text-gray-400" size={24} />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="text-neon-purple" size={20} />
          Глубинный ИИ-Синтез
        </h3>
        <p className="text-gray-400 max-w-xl mx-auto">
          Персональный разбор от нейросети, объединяющий вашу астрологическую карту и психологический профиль для полного понимания вашего пути.
        </p>
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold text-gray-300 uppercase tracking-widest mt-2">
          Скоро
        </div>
      </motion.div>
    </div>
  );
}
