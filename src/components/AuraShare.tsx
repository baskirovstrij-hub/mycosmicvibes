import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Share, Download, Check, Orbit, Sparkles } from 'lucide-react';
import { feedback } from '../lib/haptics';

interface AuraShareProps {
  userName: string;
  sunSign: string;
  mbti: string;
}

export default function AuraShare({ userName, sunSign, mbti }: AuraShareProps) {
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
      const file = new File([blob], 'cosmic-vibes-aura.png', { type: 'image/png' });

      // Try native share first
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Моя Космическая Аура | CosmicVibes',
          text: `Смотри, какую ауру мне рассчитало приложение CosmicVibes! ✨ Мой астральный профиль: ${userName}. Узнай свою судьбу здесь: ${window.location.origin}`,
          files: [file]
        });
      } else {
        // Fallback to download
        const link = document.createElement('a');
        link.download = 'cosmic-vibes-aura.png';
        link.href = dataUrl;
        link.click();
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      feedback.heavy();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-8 flex flex-col items-center relative">
      {/* Hide the actual export card so it doesn't break UI layout but can be captured */}
      <div className="fixed -left-[9999px]">
          <div ref={cardRef} className="w-[1080px] h-[1920px] bg-[#050505] flex flex-col border-4 border-black box-border relative overflow-hidden font-sans">
            {/* Deep Mystical Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-black to-[#0d0a1a]" />
            
            {/* Soft Ambient Auras */}
            <div className="absolute top-[-10%] left-[-10%] w-[1200px] h-[1200px] bg-purple-600/10 blur-[200px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[0%] right-[-20%] w-[1400px] h-[1400px] bg-blue-600/10 blur-[220px] rounded-full mix-blend-screen" />
            <div className="absolute top-[30%] left-[10%] w-[800px] h-[800px] bg-purple-500/5 blur-[180px] rounded-full mix-blend-screen" />
            
            {/* Grainy Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Dynamic Stars Layer */}
            {Array.from({ length: 120 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full opacity-30"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  boxShadow: '0 0 10px rgba(255,255,255,0.4)'
                }}
              />
            ))}

            <div className="relative z-10 flex flex-col items-center justify-between w-full h-full text-center py-32 px-20">
               {/* Branding */}
               <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center p-5 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                     <Orbit size={64} className="text-white" strokeWidth={1.5} />
                  </div>
                  <p className="text-3xl text-white/40 font-light tracking-[0.8em] uppercase">CosmicVibes</p>
               </div>

               {/* Central Profile Area */}
               <div className="flex flex-col items-center w-full">
                  <div className="relative mb-16">
                     <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
                     <h1 className="text-[160px] font-black text-white uppercase tracking-tighter leading-none relative z-10">
                       {userName.substring(0, 12)}
                     </h1>
                     <div className="h-1 w-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-4" />
                  </div>
                  
                  <p className="text-[44px] text-gray-400 font-light tracking-[0.4em] uppercase mb-32 italic">
                    Астральный Профиль
                  </p>

                  <div className="grid grid-cols-2 gap-10 w-full">
                    <div className="bg-white/[0.03] backdrop-blur-3xl px-10 py-16 rounded-[4rem] border border-white/[0.08] flex flex-col items-center justify-center shadow-2xl">
                      <p className="text-purple-500 text-2xl uppercase tracking-[0.4em] mb-8 font-medium">Солнце</p>
                      <p className="text-white text-7xl font-light tracking-wider leading-tight">{sunSign || '—'}</p>
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-3xl px-10 py-16 rounded-[4rem] border border-white/[0.08] flex flex-col items-center justify-center shadow-2xl">
                      <p className="text-amber-500 text-2xl uppercase tracking-[0.4em] mb-8 font-medium">Архетип</p>
                      <p className="text-white text-7xl font-light tracking-widest leading-tight">{mbti || '—'}</p>
                    </div>
                  </div>
               </div>

               {/* Footer Tagline */}
               <div className="space-y-6">
                 <p className="text-4xl text-white/30 font-light tracking-[0.3em] uppercase leading-relaxed max-w-2xl">
                    Твое будущее начертано <br/> в танце созвездий
                 </p>
                 <div className="flex items-center gap-6 justify-center opacity-40">
                    <div className="h-[1px] w-12 bg-white/50" />
                    <Sparkles size={32} className="text-purple-500" />
                    <div className="h-[1px] w-12 bg-white/50" />
                 </div>
                 <p className="text-2xl text-purple-500/60 font-light tracking-[0.8em] uppercase pt-4">cosmicvibes.app</p>
               </div>
            </div>
         </div>
      </div>

      <button
        onClick={handleShare}
        disabled={isExporting}
        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-gold/30 rounded-full transition-all duration-300 active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        
        {isExporting ? (
           <div className="w-5 h-5 border-2 border-gold border-t-transparent flex-shrink-0 animate-spin rounded-full" />
        ) : success ? (
           <Check size={20} className="text-emerald-400" />
        ) : (
           <Share size={20} className="text-gold group-hover:rotate-12 transition-transform" />
        )}
        
        <span className="text-sm font-medium tracking-widest uppercase text-white">
          {isExporting ? 'Создаем ауру...' : success ? 'Отправлено!' : 'Поделиться Аурой'}
        </span>
      </button>
      <p className="text-[10px] text-gray-500 mt-3 font-light tracking-wider uppercase">Опубликуйте в Stories</p>
    </div>
  );
}
