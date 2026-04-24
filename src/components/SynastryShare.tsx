import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Share, Check, Orbit, Sparkles, Users } from 'lucide-react';
import { feedback } from '../lib/haptics';

interface SynastryShareProps {
  score: number;
  u1Name: string;
  u2Name: string;
  details: any;
  u1Traits: any;
  u2Traits: any;
}

export default function SynastryShare({ score, u1Name, u2Name, details, u1Traits, u2Traits }: SynastryShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    feedback.medium();
    if (!cardRef.current) return;
    
    try {
      setIsExporting(true);
      
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          opacity: '1',
          backgroundColor: '#000'
        }
      });
      
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'cosmic-vibes-synastry.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Наша Космическая Совместимость | CosmicVibes',
          text: `Наш космический резонанс: ${score}%! ✨ Узнай свою совместимость в CosmicVibes: ${window.location.origin}`,
          files: [file]
        });
      } else {
        const link = document.createElement('a');
        link.download = 'cosmic-vibes-synastry.png';
        link.href = dataUrl;
        link.click();
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      feedback.heavy();
    } catch (err) {
      console.error('Failed to export synastry card', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-8">
      {/* Export Card (Hidden) */}
      <div className="fixed -left-[9999px]">
          <div ref={cardRef} className="w-[1080px] h-[1920px] bg-[#050505] relative overflow-hidden flex flex-col items-center py-24 font-sans">
            {/* Deep Cosmic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-black to-[#0d0a1a]" />
            
            {/* Soft Ambient Auras */}
            <div className="absolute top-[-5%] left-[-10%] w-[1200px] h-[1200px] bg-purple-600/5 blur-[200px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[10%] right-[-10%] w-[1000px] h-[1000px] bg-blue-600/5 blur-[200px] rounded-full mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-[250px] rounded-full mix-blend-screen" />

            {/* Grainy Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Dense Stars */}
            {Array.from({ length: 250 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full opacity-30"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  boxShadow: '0 0 8px rgba(255,255,255,0.4)'
                }}
              />
            ))}
            
            {/* Elegant Header Branding */}
            <div className="flex flex-col items-center gap-6 mb-24 z-10">
               <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center p-4">
                  <Orbit size={48} className="text-white" strokeWidth={1.5} />
               </div>
               <p className="text-3xl text-white/40 font-light tracking-[0.8em] uppercase italic">
                 Синергия Потоков
               </p>
            </div>

            {/* Main Score Area */}
            <div className="relative mb-20 z-10 flex flex-col items-center">
               <div className="w-[500px] h-[500px] rounded-full border border-white/[0.03] flex items-center justify-center relative bg-white/[0.01] backdrop-blur-sm shadow-[0_0_100px_rgba(168,85,247,0.1)]">
                  <div className="absolute inset-8 border border-dashed border-purple-500/10 rounded-full animate-spin-slow" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent rounded-full" />
                  <div className="flex flex-col items-center justify-center relative z-20">
                    <h1 className="text-[240px] font-black text-white leading-none tracking-tighter filter drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                      {score}
                    </h1>
                    <div className="h-1.5 w-32 bg-purple-500 rounded-full mt-4" />
                  </div>
               </div>
               
               <p className="text-[54px] text-gray-300 font-light tracking-[0.3em] uppercase mt-16 max-w-3xl text-center leading-tight">
                  {u1Name} <span className="text-purple-500">&</span> {u2Name}
               </p>
            </div>

            {/* Astral Tags with Pastel Colors */}
            <div className="w-full px-20 grid grid-cols-2 gap-10 z-10 mb-16">
                <div className="bg-white/[0.03] backdrop-blur-3xl px-8 py-12 rounded-[4rem] border border-white/[0.08] flex flex-col items-center justify-center shadow-2xl h-[240px]">
                   <p className="text-amber-500 text-[18px] uppercase tracking-[0.4em] mb-6 font-medium opacity-80 italic">Созвездия</p>
                   <div className="flex items-center gap-8">
                      <span className="text-white text-[56px] font-light">{u1Traits.sun}</span>
                      <div className="w-[1px] h-12 bg-white/10" />
                      <span className="text-white text-[56px] font-light">{u2Traits.sun}</span>
                   </div>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-3xl px-8 py-12 rounded-[4rem] border border-white/[0.08] flex flex-col items-center justify-center shadow-2xl h-[240px]">
                   <p className="text-purple-500 text-[18px] uppercase tracking-[0.4em] mb-6 font-medium opacity-80 italic">Архетипы</p>
                   <div className="flex items-center gap-8">
                      <span className="text-white text-[56px] font-light tracking-wide">{u1Traits.mbti === 'Не указан' ? '—' : u1Traits.mbti}</span>
                      <div className="w-[1px] h-12 bg-white/10" />
                      <span className="text-white text-[56px] font-light tracking-wide">{u2Traits.mbti === 'Не указан' ? '—' : u2Traits.mbti}</span>
                   </div>
                </div>
            </div>

            {/* Detailed Breakdown Grid */}
            <div className="w-full px-20 grid grid-cols-3 gap-8 z-10">
                {[
                  { key: 'passion', label: 'Страсть', color: 'text-orange-500' },
                  { key: 'emotions', label: 'Эмоции', color: 'text-rose-500' },
                  { key: 'sex', label: 'Секс', color: 'text-red-500' },
                  { key: 'intellect', label: 'Разум', color: 'text-teal-500' },
                  { key: 'daily', label: 'Быт', color: 'text-sky-500' },
                  { key: 'psychology', label: 'Душа', color: 'text-amber-500' }
                ].map((item) => (
                  <div key={item.key} className="bg-white/[0.02] backdrop-blur-2xl px-6 py-10 rounded-[3rem] border border-white/[0.05] flex flex-col items-center justify-center shadow-lg group">
                     <p className={`text-sm uppercase tracking-[0.3em] mb-4 font-light opacity-70 ${item.color}`}>{item.label}</p>
                     <p className="text-white text-[64px] font-black tracking-tighter leading-none">{details[item.key]?.score || 0}%</p>
                  </div>
                ))}
            </div>

            {/* Footer with Tagline */}
            <div className="mt-auto pt-20 pb-20 flex flex-col items-center gap-10 z-10 w-full px-32">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <p className="text-[36px] text-white/30 font-light tracking-[0.4em] uppercase text-center leading-relaxed italic">
                   Где встречаются звезды — рождается бесконечность
                </p>
                <div className="flex flex-col items-center gap-2 opacity-30">
                   <p className="text-2xl tracking-[1em] uppercase text-purple-500">cosmicvibes.app</p>
                </div>
            </div>
          </div>
      </div>

      <button
        onClick={handleShare}
        disabled={isExporting}
        className="group relative inline-flex items-center gap-3 px-10 py-5 bg-purple-500/10 hover:bg-purple-500/20 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/50 rounded-full transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
      >
        {isExporting ? (
           <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent animate-spin rounded-full" />
        ) : success ? (
           <Check size={20} className="text-emerald-400" />
        ) : (
           <Sparkles size={20} className="text-gold group-hover:scale-125 transition-transform" />
        )}
        <span className="text-sm font-bold tracking-[0.2em] uppercase text-white">
          {isExporting ? 'Создаем карту...' : success ? 'Отправлено!' : 'Поделиться Совместимостью'}
        </span>
      </button>
      <p className="text-[10px] text-gray-500 mt-4 font-light tracking-widest uppercase">Отправьте половинке</p>
    </div>
  );
}
