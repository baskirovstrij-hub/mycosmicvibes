import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Users, Sparkles, Calendar, Info, Search } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const SIGNS = [
  { id: 'Aries', label: 'Овен', element: 'Fire', dates: '21 марта - 19 апреля' },
  { id: 'Taurus', label: 'Телец', element: 'Earth', dates: '20 апреля - 20 мая' },
  { id: 'Gemini', label: 'Близнецы', element: 'Air', dates: '21 мая - 20 июня' },
  { id: 'Cancer', label: 'Рак', element: 'Water', dates: '21 июня - 22 июля' },
  { id: 'Leo', label: 'Лев', element: 'Fire', dates: '23 июля - 22 августа' },
  { id: 'Virgo', label: 'Дева', element: 'Earth', dates: '23 августа - 22 сентября' },
  { id: 'Libra', label: 'Весы', element: 'Air', dates: '23 сентября - 22 октября' },
  { id: 'Scorpio', label: 'Скорпион', element: 'Water', dates: '23 октября - 21 ноября' },
  { id: 'Sagittarius', label: 'Стрелец', element: 'Fire', dates: '22 ноября - 21 декабря' },
  { id: 'Capricorn', label: 'Козерог', element: 'Earth', dates: '22 декабря - 19 января' },
  { id: 'Aquarius', label: 'Водолей', element: 'Air', dates: '20 января - 18 февраля' },
  { id: 'Pisces', label: 'Рыбы', element: 'Water', dates: '19 февраля - 20 марта' }
];

const getZodiacSign = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

const getCompatibility = (sign1: string, sign2: string) => {
  const s1 = SIGNS.find(s => s.id === sign1);
  const s2 = SIGNS.find(s => s.id === sign2);
  if (!s1 || !s2) return null;

  const elementCompat: Record<string, Record<string, { love: string, general: string, score: number }>> = {
    Fire: {
      Fire: { 
        love: 'Яркий, страстный союз. Два пламени могут создать как согревающий очаг, так и лесной пожар. Важно давать друг другу пространство.', 
        general: 'Высокая активность и взаимопонимание. Вы вдохновляете друг друга на подвиги, но можете конкурировать за лидерство.',
        score: 85
      },
      Earth: { 
        love: 'Сложное сочетание. Огонь может обжечь землю, а земля — засыпать огонь. Требуется много терпения и притирки.', 
        general: 'Огонь дает идеи, Земля их реализует. Хороший деловой союз, если Огонь не будет слишком нетерпелив.',
        score: 55
      },
      Air: { 
        love: 'Идеальное сочетание. Воздух раздувает пламя Огня, делая его ярче. Вы понимаете друг друга с полуслова.', 
        general: 'Прекрасное интеллектуальное и творческое взаимодействие. Вместе вы способны на великие свершения.',
        score: 95
      },
      Water: { 
        love: 'Противоречивый союз. Вода тушит огонь, а огонь заставляет воду кипеть. Эмоциональные качели гарантированы.', 
        general: 'Вам сложно понять мотивы друг друга. Огонь действует импульсивно, Вода — интуитивно.',
        score: 40
      }
    },
    Earth: {
      Earth: { 
        love: 'Стабильный и надежный союз. Вы оба цените комфорт, безопасность и материальный достаток. Крепкий фундамент.', 
        general: 'Высокая продуктивность и предсказуемость. Вы отличная команда для долгосрочных проектов.',
        score: 90
      },
      Air: { 
        love: 'Интеллектуальный интерес есть, но эмоционально может быть прохладно. Земле не хватает конкретики от Воздуха.', 
        general: 'Воздух планирует, Земля строит. Если найдете общий язык, добьетесь успеха, но споров о деталях не избежать.',
        score: 60
      },
      Water: { 
        love: 'Плодородный союз. Вода питает землю, делая ее цветущей. Глубокое эмоциональное и физическое притяжение.', 
        general: 'Вы дополняете друг друга. Вода дает Земле гибкость и чувства, Земля Воде — опору и структуру.',
        score: 92
      },
      Fire: { 
        love: 'Огонь может казаться Земле слишком хаотичным, а Земля Огню — слишком скучной. Нужен компромисс.', 
        general: 'Огонь толкает Землю вперед, Земля помогает Огню заземлиться. Полезный, но энергозатратный союз.',
        score: 55
      }
    },
    Air: {
      Air: { 
        love: 'Легкий, свободный союз. Много общения, идей и путешествий. Но может не хватать глубины и стабильности.', 
        general: 'Блестящий обмен информацией. Вы лучшие друзья и единомышленники, но бытовые вопросы могут провисать.',
        score: 88
      },
      Water: { 
        love: 'Сложно. Воздух пытается анализировать чувства Воды, что ее обижает. Разные языки любви.', 
        general: 'Воздух живет в мире идей, Вода — в мире эмоций. Вам нужно учиться слушать не только разум, но и сердце.',
        score: 45
      },
      Fire: { 
        love: 'Взаимное вдохновение. Вы оба любите свободу и новизну. Отношения полны энтузиазма и радости.', 
        general: 'Отличная синергия. Воздух дает стратегию, Огонь — энергию для реализации.',
        score: 95
      },
      Earth: { 
        love: 'Земля хочет обязательств, Воздух — свободы. Если договоритесь о правилах, союз может быть долгим.', 
        general: 'Разный темп жизни. Земля медленная и основательная, Воздух быстрый и переменчивый.',
        score: 60
      }
    },
    Water: {
      Water: { 
        love: 'Океан чувств. Глубочайшее понимание без слов. Но вы можете утонуть в эмоциях и обидах друг друга.', 
        general: 'Высокая эмпатия. Вы чувствуете состояние партнера кожей. Важно не терять связь с реальностью.',
        score: 82
      },
      Fire: { 
        love: 'Кипящие страсти. Много драмы и слез, но и притяжение невероятное. Отношения как на вулкане.', 
        general: 'Вам трудно найти общую почву. Огонь слишком прямолинеен для тонкой натуры Воды.',
        score: 40
      },
      Earth: { 
        love: 'Один из самых гармоничных союзов. Вы даете друг другу то, чего не хватает: заботу и стабильность.', 
        general: 'Прекрасное сотрудничество. Вы чувствуете себя в безопасности рядом друг с другом.',
        score: 92
      },
      Air: { 
        love: 'Воздух может казаться Воде холодным и отстраненным. Вода Воздуху — слишком иррациональной.', 
        general: 'Трудно достичь согласия. Интеллект против интуиции.',
        score: 45
      }
    }
  };

  return elementCompat[s1.element][s2.element];
};

interface ZodiacCompatibilityProps {
  userSign: string;
}

export default function ZodiacCompatibility({ userSign }: ZodiacCompatibilityProps) {
  const [partnerSign, setPartnerSign] = useState<string | null>(null);
  const [inputType, setInputType] = useState<'sign' | 'date'>('sign');
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | null) => {
    setBirthDate(date);
    if (date) {
      setPartnerSign(getZodiacSign(date));
    }
  };

  const compat = partnerSign ? getCompatibility(userSign, partnerSign) : null;
  const userSignInfo = SIGNS.find(s => s.id === userSign);
  const partnerSignInfo = partnerSign ? SIGNS.find(s => s.id === partnerSign) : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Зодиакальная связь</h2>
        <p className="text-gray-400">Узнайте совместимость вашего знака с партнером</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* User Sign Card */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold/60">Ваш знак</span>
          <div className="text-6xl">
            {userSign === 'Aries' && '♈'}
            {userSign === 'Taurus' && '♉'}
            {userSign === 'Gemini' && '♊'}
            {userSign === 'Cancer' && '♋'}
            {userSign === 'Leo' && '♌'}
            {userSign === 'Virgo' && '♍'}
            {userSign === 'Libra' && '♎'}
            {userSign === 'Scorpio' && '♏'}
            {userSign === 'Sagittarius' && '♐'}
            {userSign === 'Capricorn' && '♑'}
            {userSign === 'Aquarius' && '♒'}
            {userSign === 'Pisces' && '♓'}
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white">{userSignInfo?.label}</h3>
            <p className="text-sm text-gray-400">{userSignInfo?.dates}</p>
          </div>
        </div>

        {/* Partner Selection Card */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center space-y-6">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-full">
            <button
              onClick={() => setInputType('sign')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${inputType === 'sign' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Выбрать знак
            </button>
            <button
              onClick={() => setInputType('date')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${inputType === 'date' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Дата рождения
            </button>
          </div>

          {inputType === 'sign' ? (
            <div className="grid grid-cols-3 gap-2 w-full">
              {SIGNS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setPartnerSign(s.id)}
                  className={`p-2 rounded-xl border text-[10px] font-bold transition-all ${partnerSign === s.id ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Дата рождения партнера</label>
              <CustomDatePicker value={birthDate} onChange={handleDateChange} />
            </div>
          )}

          {partnerSignInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-2 pt-2"
            >
              <div className="text-4xl">
                {partnerSign === 'Aries' && '♈'}
                {partnerSign === 'Taurus' && '♉'}
                {partnerSign === 'Gemini' && '♊'}
                {partnerSign === 'Cancer' && '♋'}
                {partnerSign === 'Leo' && '♌'}
                {partnerSign === 'Virgo' && '♍'}
                {partnerSign === 'Libra' && '♎'}
                {partnerSign === 'Scorpio' && '♏'}
                {partnerSign === 'Sagittarius' && '♐'}
                {partnerSign === 'Capricorn' && '♑'}
                {partnerSign === 'Aquarius' && '♒'}
                {partnerSign === 'Pisces' && '♓'}
              </div>
              <h3 className="text-xl font-bold text-white">{partnerSignInfo.label}</h3>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {compat && partnerSignInfo && (
          <motion.div
            key={partnerSign}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Heart className="text-red-500 fill-red-500 animate-pulse" size={48} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-white">{compat.score}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Результат совместимости</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-pink-500/5 border border-pink-500/20 space-y-3">
                <div className="flex items-center gap-2 text-pink-400">
                  <Heart size={20} />
                  <h4 className="font-bold uppercase text-sm">Любовный план</h4>
                </div>
                <p className="text-gray-300 leading-relaxed italic">"{compat.love}"</p>
              </div>

              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Users size={20} />
                  <h4 className="font-bold uppercase text-sm">Общий план</h4>
                </div>
                <p className="text-gray-300 leading-relaxed italic">"{compat.general}"</p>
              </div>
            </div>

            <div className="p-4 bg-gold/5 border border-gold/20 rounded-2xl flex items-start gap-3">
              <Sparkles className="text-gold shrink-0 mt-1" size={18} />
              <p className="text-xs text-gray-400 leading-relaxed">
                Помните, что солнечный знак — это лишь вершина айсберга. Для глубокого анализа используйте вкладку <span className="text-gold font-bold">"Совместимость"</span>, где учитываются все планеты и аспекты ваших натальных карт.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
