import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Heart, Home, Zap, Smile, Brain, Flame, Sparkles, Star, User, Compass } from 'lucide-react';
import Markdown from 'react-markdown';
import SynastryShare from './SynastryShare';

const ARCHITECTURE_DEFS: Record<string, string> = {
  'passion': 'Огонь, влечение и искра между вами',
  'emotions': 'Чувственность, эмпатия и поддержка',
  'intellect': 'Понимание, интересы и образ мысли',
  'sex': 'Телесный резонанс и страсть',
  'daily': 'Совместный быт и рутина',
  'psychology': 'Архетипическая близость душ'
};

const CustomAstroRadar = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;
  const size = 500;
  const center = size / 2;
  const radius = size * 0.35;
  const total = data.length;

  const getPoint = (val: number, max: number, index: number) => {
     const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
     const r = (val / max) * radius;
     return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
  };

  const gridLevels = [0.33, 0.66, 1.0];
  
  return (
     <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-h-[70vh] aspect-square overflow-visible drop-shadow-[0_0_25px_rgba(168,85,247,0.15)]">
        <defs>
           <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
             <stop offset="0%" stopColor="#ba76ff" stopOpacity="0.3" />
             <stop offset="50%" stopColor="#a855f7" stopOpacity="0.1" />
             <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
           </linearGradient>
           <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
             <stop offset="0%" stopColor="#ba76ff" />
             <stop offset="50%" stopColor="#a855f7" />
             <stop offset="100%" stopColor="#60a5fa" />
           </linearGradient>
        </defs>
        {/* Axes */}
        {data.map((_, i) => {
           const { x, y } = getPoint(100, 100, i);
           return <line key={`axis-${i}`} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        })}
        {/* Grid */}
        {gridLevels.map(level => {
           const pts = data.map((_, i) => {
              const { x, y } = getPoint(100 * level, 100, i);
              return `${x},${y}`;
           }).join(' ');
           return <polygon key={`grid-${level}`} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="3 6" />
        })}

        {/* Data Polygon */}
        <polygon 
          points={data.map((d, i) => getPoint(d.score, 100, i)).map(p => `${p.x},${p.y}`).join(' ')} 
          fill="url(#radarFill)" 
          stroke="url(#radarStroke)" 
          strokeWidth="2" 
          className="filter drop-shadow-[0_0_12px_rgba(186,118,255,0.4)]"
        />

        {/* Labels */}
        {data.map((d, i) => {
           const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
           const r = radius + 45; 
           const x = center + Math.cos(angle) * r;
           const y = center + Math.sin(angle) * r;
           
           let anchor: "middle" | "start" | "end" = "middle";
           if (Math.cos(angle) > 0.05) anchor = "start";
           if (Math.cos(angle) < -0.05) anchor = "end";

           return (
             <text 
                key={`label-${i}`} 
                x={x} 
                y={y} 
                textAnchor={anchor} 
                alignmentBaseline="middle" 
                className="text-[11px] md:text-sm font-medium fill-gray-100 uppercase tracking-[0.2em]"
             >
               {d.subject}
             </text>
           );
        })}
     </svg>
  );
};

const ArchitectureTile = ({ item, detailScore }: { item: any, detailScore: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      key={`badge-${item.key}`} 
      onClick={() => setIsFlipped(!isFlipped)}
      className={`rounded-2xl border border-white/5 bg-white/[0.02] flex group transition-all hover:border-white/20 hover:bg-white/[0.05] cursor-pointer h-[64px] md:h-[72px] relative overflow-hidden`}
    >
      {!isFlipped ? (
        <div className="flex flex-row items-center justify-between h-full w-full absolute inset-0 px-4 md:px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5 ${item.color} shrink-0`}>
              <item.icon size={14} />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-gray-300 uppercase tracking-widest truncate">{item.title}</span>
          </div>
          <div className="flex items-end gap-1 shrink-0 ml-3">
            <span className="text-xl md:text-2xl font-light text-white leading-none">{detailScore}</span>
            <span className="text-[10px] text-gray-600 mb-0.5">%</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-full w-full absolute inset-0 px-4 bg-white/[0.02]">
          <span className={`text-[9px] md:text-[10px] uppercase font-light tracking-[0.2em] opacity-80 leading-relaxed ${item.color}`}>
            {ARCHITECTURE_DEFS[item.key] || item.title}
          </span>
        </div>
      )}
    </div>
  );
};

interface SynastryDetail {
  score: number;
  text: string;
  tips?: string[];
}

interface Traits {
  name: string;
  sun: string;
  moon: string;
  venus: string;
  mars: string;
  mbti: string;
}

interface SynastryResultProps {
  score: number;
  details: {
    sex: SynastryDetail;
    daily: SynastryDetail;
    emotions: SynastryDetail;
    intellect: SynastryDetail;
    passion: SynastryDetail;
    psychology: SynastryDetail;
  };
  u1Traits: Traits;
  u2Traits: Traits;
}

export default function SynastryResult({ score, details, u1Traits, u2Traits }: SynastryResultProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const tm = setTimeout(() => setAnimatedScore(score), 50);
    return () => clearTimeout(tm);
  }, [score]);

  const hasMbti = u1Traits.mbti !== 'Не указан' && u2Traits.mbti !== 'Не указан';

  const detailItems = [
    { key: 'psychology', title: 'Психология', icon: User, color: 'text-amber-500', border: 'border-amber-500/20 hover:border-amber-500/50', bg: 'bg-amber-500/10 hover:bg-amber-500/20', hidden: !hasMbti },
    { key: 'passion', title: 'Страсть', icon: Flame, color: 'text-orange-500', border: 'border-orange-500/20 hover:border-orange-500/50', bg: 'bg-orange-500/10 hover:bg-orange-500/20' },
    { key: 'emotions', title: 'Эмоции', icon: Smile, color: 'text-rose-500', border: 'border-rose-500/20 hover:border-rose-500/50', bg: 'bg-rose-500/10 hover:bg-rose-500/20' },
    { key: 'intellect', title: 'Интеллект', icon: Brain, color: 'text-teal-500', border: 'border-teal-500/20 hover:border-teal-500/50', bg: 'bg-teal-500/10 hover:bg-teal-500/20' },
    { key: 'sex', title: 'Секс', icon: Zap, color: 'text-red-500', border: 'border-red-500/20 hover:border-red-500/50', bg: 'bg-red-500/10 hover:bg-red-500/20' },
    { key: 'daily', title: 'Быт', icon: Home, color: 'text-sky-500', border: 'border-sky-500/20 hover:border-sky-500/50', bg: 'bg-sky-500/10 hover:bg-sky-500/20' },
  ].filter(item => !item.hidden);

  const chartData = detailItems.map(item => ({
    subject: item.title,
    score: details[item.key as keyof typeof details].score,
  }));

  const getVerdict = (s: number) => {
    if (s > 85) return "Божественный союз. Ваши души резонируют на высших частотах Вселенной.";
    if (s > 70) return "Гармоничное созвучие. Звезды благоволят вашему совместному пути.";
    if (s > 50) return "Земное притяжение. У вас есть прочный фундамент для роста и трансформации.";
    return "Кармическое испытание. Этот союз дан для глубоких уроков и осознания себя.";
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="w-full max-w-6xl mx-auto p-4 md:p-6 relative space-y-24"
    >
      {/* Header & Score Group */}
      <motion.div variants={itemVariants} className="flex flex-col items-center">
        <div className="relative z-10 text-center pt-[30px] mb-8">
          <h3 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase tracking-tighter mb-[8px]">
            Космический Резонанс
          </h3>
          <p className="text-purple-500 font-medium tracking-[0.2em] md:tracking-[0.4em] uppercase text-[11px] opacity-90 max-w-xl mx-auto leading-relaxed">
            {getVerdict(score)}
          </p>
        </div>
          
        <div className="relative z-10 flex flex-col items-center justify-center pb-12 w-full">
          <div className="relative flex justify-center items-center w-[220px] h-[220px] md:w-[280px] md:h-[280px] mx-auto">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-10 pointer-events-none">
              <g transform="rotate(-90 50 50)">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-white/5 fill-none"
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-purple-500 fill-none transition-all duration-[2000ms] ease-out"
                  strokeWidth="2.5"
                  pathLength="100"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - animatedScore}
                  strokeLinecap="round"
                />
              </g>
            </svg>

            <div className="relative z-30 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-6xl md:text-7xl font-light text-white tracking-tighter">
                {score}
              </span>
              <span className="text-purple-500/50 font-light text-[9px] md:text-[11px] tracking-[0.4em] uppercase mt-1">
                совместимость
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comparison Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto px-4">
        <div className="p-6 md:p-8 rounded-[2rem] relative overflow-hidden group border border-white/5 bg-white/[0.01]">
          <h4 className="text-xl md:text-2xl font-light text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
            <User size={20} className="text-purple-500" />
            {u1Traits.name}
          </h4>
          <div className="space-y-4 relative z-10 text-sm md:text-base">
            {[
              { label: 'Солнце (Эго)', value: u1Traits.sun, color: 'text-amber-500/90' },
              { label: 'Луна (Душа)', value: u1Traits.moon, color: 'text-sky-500/90' },
              { label: 'Венера (Любовь)', value: u1Traits.venus, color: 'text-rose-500/90' },
              { label: 'Марс (Воля)', value: u1Traits.mars, color: 'text-red-500/90' },
              { label: 'Архетип (MBTI)', value: u1Traits.mbti, color: 'text-purple-500/90' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-gray-400 uppercase tracking-widest font-light text-[10px]">{row.label}</span>
                <span className={`${row.color} font-light`}>{row.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-[2rem] relative overflow-hidden group border border-white/5 bg-white/[0.01]">
          <h4 className="text-xl md:text-2xl font-light text-white mb-6 flex items-center justify-end gap-3 uppercase tracking-widest">
            {u2Traits.name}
            <User size={20} className="text-purple-500" />
          </h4>
          <div className="space-y-4 relative z-10 text-sm md:text-base">
            {[
              { label: 'Солнце (Эго)', value: u2Traits.sun, color: 'text-amber-500/90' },
              { label: 'Луна (Душа)', value: u2Traits.moon, color: 'text-sky-500/90' },
              { label: 'Венера (Любовь)', value: u2Traits.venus, color: 'text-rose-500/90' },
              { label: 'Марс (Воля)', value: u2Traits.mars, color: 'text-red-500/90' },
              { label: 'Архетип (MBTI)', value: u2Traits.mbti, color: 'text-purple-500/90' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className={`${row.color} font-light`}>{row.value || '—'}</span>
                <span className="text-gray-400 uppercase tracking-widest font-light text-[10px]">{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Radar & Architecture Sections */}
      <motion.div variants={itemVariants} className="flex flex-col items-center space-y-16">
        <div className="relative w-full max-w-[600px] flex items-center justify-center mx-auto">
          <CustomAstroRadar data={chartData} />
        </div>

        <div className="w-full space-y-12">
          <div className="space-y-4 max-w-3xl mx-auto md:text-center px-4">
            <h4 className="text-xl md:text-[22px] font-light text-white flex items-center md:justify-center gap-4 uppercase tracking-[0.4em]">
              Архитектура Связи
            </h4>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
              Ваши астральные тела вступают в сложный танец энергий. Представленная диаграмма визуализирует баланс фундаментальных столпов ваших отношений.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 w-full max-w-full overflow-hidden px-4">
            {detailItems.map(item => {
              const detailScore = details[item.key as keyof typeof details].score;
              return <ArchitectureTile key={item.key} item={item} detailScore={detailScore} />;
            })}
          </div>
        </div>
      </motion.div>

      {/* Detailed Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full px-4 pt-10">
        {detailItems.map((item) => {
          const detail = details[item.key as keyof typeof details];
          return (
            <motion.div 
              key={`card-${item.key}`} 
              variants={itemVariants}
              className="p-6 md:p-10 group relative flex flex-col h-full border-t border-white/5"
            >
              <div className="flex flex-row items-center justify-center gap-4 md:gap-8 mb-8 md:mb-12 relative z-10 w-full flex-nowrap px-2">
                <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm ${item.color} shrink-0`}>
                  <item.icon size={24} />
                </div>
                <h4 className="font-light text-[22px] md:text-[24px] uppercase tracking-[0.2em] text-white">
                  {item.title}
                </h4>
                <div className="text-[26px] md:text-[30px] font-light text-white/30 shrink-0">
                  {detail.score}%
                </div>
              </div>
              
              <div className="space-y-8 relative z-10 flex-1 flex flex-col">
                <div className="text-gray-400 text-sm md:text-base font-light leading-relaxed markdown-container flex-1 min-h-[200px]">
                  <Markdown components={{
                     strong: ({node, ...props}) => <strong className="text-white font-medium block mt-6 mb-2 text-[11px] md:text-xs uppercase tracking-[0.1em] border-b border-white/10 pb-1" {...props} />,
                     p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />
                  }}>
                    {detail.text}
                  </Markdown>
                </div>
                
                {detail.tips && detail.tips.length > 0 && (
                  <div className="pt-10 border-t border-white/10 space-y-6 mt-auto">
                    <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.4em] text-purple-500 flex items-center gap-3">
                       <Sparkles size={14} className="text-purple-500 opacity-80" />
                       Звездные Советы
                    </p>
                    <ul className="grid grid-cols-1 gap-5">
                      {detail.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-gray-400 text-[13px] md:text-sm leading-relaxed">
                          <div className={`w-1 h-1 rounded-full mt-2.5 shrink-0 ${item.color} shadow-[0_0_8px_currentColor]`} />
                          <span className="font-light">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div variants={itemVariants} className="w-full flex justify-center py-10 pb-20">
        <SynastryShare 
          score={score} 
          u1Name={u1Traits.name} 
          u2Name={u2Traits.name} 
          details={details}
          u1Traits={u1Traits}
          u2Traits={u2Traits}
        />
      </motion.div>
    </motion.div>
  );
}
