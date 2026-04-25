import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DailyVibeProps {
  horoscope: {
    type: 'positive' | 'neutral' | 'negative';
    text: string;
    vibe: string;
  } | null;
}

export default function DailyVibe({ horoscope }: DailyVibeProps) {
  if (!horoscope) return null;

  const config = {
    positive: {
      icon: CheckCircle2,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    neutral: {
      icon: Info,
      color: 'text-gold',
      bg: 'bg-gold/10',
      border: 'border-gold/20'
    },
    negative: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    }
  };

  const { icon: Icon, color, bg, border } = config[horoscope.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full p-6 rounded-3xl border ${border} ${bg} backdrop-blur-md space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${bg}`}>
            <Icon className={color} size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Гороскоп</h4>
            <p className="text-xl font-bold text-gold">{horoscope.vibe.toLowerCase().replace(/^\w/, c => c.toUpperCase())}</p>
          </div>
        </div>
        <Sparkles className="text-gold/30" size={20} />
      </div>
      
      <p className="text-gray-200 leading-relaxed text-lg italic first-letter:uppercase">
        "{horoscope.text.toLowerCase().replace(/^\s*\w/, c => c.toUpperCase())}"
      </p>
      
      <div className="pt-2 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-tighter">
        <div className="w-1 h-1 rounded-full bg-gold" />
        Обновляется каждые 24 часа на основе транзита Луны
      </div>
    </motion.div>
  );
}
